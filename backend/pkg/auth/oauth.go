package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

type OAuthProvider struct {
	Config *oauth2.Config
	Name   string
}

type OAuthUserInfo struct {
	ID        string
	Email     string
	Name      string
	AvatarURL string
}

func NewGoogleOAuth(clientID, clientSecret, redirectURL string) *OAuthProvider {
	return &OAuthProvider{
		Name: "google",
		Config: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func NewGitHubOAuth(clientID, clientSecret, redirectURL string) *OAuthProvider {
	return &OAuthProvider{
		Name: "github",
		Config: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes:       []string{"user:email"},
			Endpoint:     github.Endpoint,
		},
	}
}

func (p *OAuthProvider) GetAuthURL(state string) string {
	return p.Config.AuthCodeURL(state)
}

func (p *OAuthProvider) ExchangeCode(ctx context.Context, code string) (*oauth2.Token, error) {
	return p.Config.Exchange(ctx, code)
}

func (p *OAuthProvider) GetUserInfo(ctx context.Context, token *oauth2.Token) (*OAuthUserInfo, error) {
	client := p.Config.Client(ctx, token)

	var userInfoURL string
	if p.Name == "google" {
		userInfoURL = "https://www.googleapis.com/oauth2/v2/userinfo"
	} else if p.Name == "github" {
		userInfoURL = "https://api.github.com/user"
	} else {
		return nil, fmt.Errorf("unsupported provider: %s", p.Name)
	}

	resp, err := client.Get(userInfoURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if p.Name == "google" {
		return p.parseGoogleUserInfo(body)
	} else if p.Name == "github" {
		return p.parseGitHubUserInfo(ctx, client, body)
	}

	return nil, fmt.Errorf("unsupported provider")
}

func (p *OAuthProvider) parseGoogleUserInfo(body []byte) (*OAuthUserInfo, error) {
	var data struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return &OAuthUserInfo{
		ID:        data.ID,
		Email:     data.Email,
		Name:      data.Name,
		AvatarURL: data.Picture,
	}, nil
}

func (p *OAuthProvider) parseGitHubUserInfo(ctx context.Context, client *http.Client, body []byte) (*OAuthUserInfo, error) {
	var data struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	email, err := p.getGitHubEmail(client)
	if err != nil {
		return nil, err
	}

	name := data.Name
	if name == "" {
		name = data.Login
	}

	return &OAuthUserInfo{
		ID:        fmt.Sprintf("%d", data.ID),
		Email:     email,
		Name:      name,
		AvatarURL: data.AvatarURL,
	}, nil
}

func (p *OAuthProvider) getGitHubEmail(client *http.Client) (string, error) {
	resp, err := client.Get("https://api.github.com/user/emails")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return "", err
	}

	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email, nil
		}
	}

	if len(emails) > 0 {
		return emails[0].Email, nil
	}

	return "", fmt.Errorf("no email found")
}
