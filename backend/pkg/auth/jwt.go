package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type JWTManager struct {
	secretKey            string
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
}

func NewJWTManager(secretKey string) *JWTManager {
	return &JWTManager{
		secretKey:            secretKey,
		accessTokenDuration:  15 * time.Minute,
		refreshTokenDuration: 7 * 24 * time.Hour,
	}
}

func (m *JWTManager) GenerateAccessToken(userID uuid.UUID, email string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secretKey))
}

func (m *JWTManager) GenerateRefreshToken() (string, time.Time, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", time.Time{}, err
	}

	token := base64.URLEncoding.EncodeToString(b)
	expiresAt := time.Now().Add(m.refreshTokenDuration)

	return token, expiresAt, nil
}

func (m *JWTManager) GenerateTokenPair(userID uuid.UUID, email string) (*TokenPair, time.Time, error) {
	accessToken, err := m.GenerateAccessToken(userID, email)
	if err != nil {
		return nil, time.Time{}, err
	}

	refreshToken, expiresAt, err := m.GenerateRefreshToken()
	if err != nil {
		return nil, time.Time{}, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(m.accessTokenDuration.Seconds()),
	}, expiresAt, nil
}

func (m *JWTManager) Verify(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(m.secretKey), nil
		},
	)

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, ErrInvalidToken
	}

	if time.Now().After(claims.ExpiresAt.Time) {
		return nil, ErrExpiredToken
	}

	return claims, nil
}
