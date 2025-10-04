package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/theosov/hexa/db/sqlc"
	"github.com/theosov/hexa/pkg/auth"
	"github.com/theosov/hexa/pkg/cache"
)

type AuthHandler struct {
	db          *sqlc.Queries
	jwtManager  *auth.JWTManager
	googleOAuth *auth.OAuthProvider
	githubOAuth *auth.OAuthProvider
	redis       *cache.RedisClient
	frontendURL string
}

func NewAuthHandler(
	db *sqlc.Queries,
	jwtManager *auth.JWTManager,
	googleOAuth *auth.OAuthProvider,
	githubOAuth *auth.OAuthProvider,
	redis *cache.RedisClient,
	frontendURL string,
) *AuthHandler {
	return &AuthHandler{
		db:          db,
		jwtManager:  jwtManager,
		googleOAuth: googleOAuth,
		githubOAuth: githubOAuth,
		redis:       redis,
		frontendURL: frontendURL,
	}
}

func generateState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	state, err := generateState()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate state",
		})
	}

	userAgent := c.Get("User-Agent")
	if err := h.redis.SetOAuthState(c.Context(), state, userAgent); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to store state",
		})
	}

	url := h.googleOAuth.GetAuthURL(state)
	return c.Redirect(url)
}

func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	state := c.Query("state")
	code := c.Query("code")

	valid, err := h.redis.VerifyOAuthState(c.Context(), state)
	if err != nil || !valid {
		return c.Redirect(h.frontendURL + "/login?error=invalid_state")
	}

	token, err := h.googleOAuth.ExchangeCode(context.Background(), code)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=oauth_failed")
	}

	userInfo, err := h.googleOAuth.GetUserInfo(context.Background(), token)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=user_info_failed")
	}

	user, err := h.createOrGetUser(c.Context(), "google", userInfo)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=create_user_failed")
	}

	tokens, expiresAt, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=token_generation_failed")
	}

	_, err = h.db.CreateRefreshToken(c.Context(), sqlc.CreateRefreshTokenParams{
		UserID: user.ID,
		Token:  tokens.RefreshToken,
		ExpiresAt: pgtype.Timestamp{
			Time:  expiresAt,
			Valid: true,
		},
	})
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=save_token_failed")
	}

	redirectURL := fmt.Sprintf("%s/auth/callback?access_token=%s&refresh_token=%s",
		h.frontendURL, tokens.AccessToken, tokens.RefreshToken)
	return c.Redirect(redirectURL)
}

func (h *AuthHandler) GitHubLogin(c *fiber.Ctx) error {
	state, err := generateState()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate state",
		})
	}

	userAgent := c.Get("User-Agent")
	if err := h.redis.SetOAuthState(c.Context(), state, userAgent); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to store state",
		})
	}

	url := h.githubOAuth.GetAuthURL(state)
	return c.Redirect(url)
}

func (h *AuthHandler) GitHubCallback(c *fiber.Ctx) error {
	state := c.Query("state")
	code := c.Query("code")

	valid, err := h.redis.VerifyOAuthState(c.Context(), state)
	if err != nil || !valid {
		return c.Redirect(h.frontendURL + "/login?error=invalid_state")
	}

	token, err := h.githubOAuth.ExchangeCode(context.Background(), code)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=oauth_failed")
	}

	userInfo, err := h.githubOAuth.GetUserInfo(context.Background(), token)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=user_info_failed")
	}

	user, err := h.createOrGetUser(c.Context(), "github", userInfo)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=create_user_failed")
	}

	tokens, expiresAt, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=token_generation_failed")
	}

	_, err = h.db.CreateRefreshToken(c.Context(), sqlc.CreateRefreshTokenParams{
		UserID: user.ID,
		Token:  tokens.RefreshToken,
		ExpiresAt: pgtype.Timestamp{
			Time:  expiresAt,
			Valid: true,
		},
	})
	if err != nil {
		return c.Redirect(h.frontendURL + "/login?error=save_token_failed")
	}

	redirectURL := fmt.Sprintf("%s/auth/callback?access_token=%s&refresh_token=%s",
		h.frontendURL, tokens.AccessToken, tokens.RefreshToken)
	return c.Redirect(redirectURL)
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	dbToken, err := h.db.GetRefreshToken(c.Context(), req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid refresh token",
		})
	}

	if time.Now().After(dbToken.ExpiresAt.Time) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "refresh token expired",
		})
	}

	user, err := h.db.GetUser(c.Context(), dbToken.UserID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not found",
		})
	}

	tokens, expiresAt, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate tokens",
		})
	}

	if err := h.db.RevokeRefreshToken(c.Context(), req.RefreshToken); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to revoke old token",
		})
	}

	_, err = h.db.CreateRefreshToken(c.Context(), sqlc.CreateRefreshTokenParams{
		UserID: user.ID,
		Token:  tokens.RefreshToken,
		ExpiresAt: pgtype.Timestamp{
			Time:  expiresAt,
			Valid: true,
		},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to save new token",
		})
	}

	return c.JSON(tokens)
}

func (h *AuthHandler) GetCurrentUser(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	user, err := h.db.GetUser(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not found",
		})
	}

	return c.JSON(fiber.Map{
		"id":            user.ID,
		"email":         user.Email,
		"display_name":  user.DisplayName,
		"avatar_url":    user.AvatarUrl,
		"storage_used":  user.StorageUsed,
		"storage_limit": user.StorageLimit,
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	if err := h.db.RevokeAllUserTokens(c.Context(), userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to logout",
		})
	}

	return c.JSON(fiber.Map{
		"message": "logged out successfully",
	})
}

func (h *AuthHandler) createOrGetUser(ctx context.Context, provider string, userInfo *auth.OAuthUserInfo) (*sqlc.User, error) {
	user, err := h.db.GetUserByOAuth(ctx, sqlc.GetUserByOAuthParams{
		OauthProvider: provider,
		OauthID:       userInfo.ID,
	})

	if err == nil {
		return &user, nil
	}

	newUser, err := h.db.CreateUser(ctx, sqlc.CreateUserParams{
		Email: userInfo.Email,
		DisplayName: pgtype.Text{
			String: userInfo.Name,
			Valid:  userInfo.Name != "",
		},
		AvatarUrl: pgtype.Text{
			String: userInfo.AvatarURL,
			Valid:  userInfo.AvatarURL != "",
		},
		OauthProvider: provider,
		OauthID:       userInfo.ID,
	})

	if err != nil {
		return nil, err
	}

	return &newUser, nil
}
