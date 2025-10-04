package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/theosov/hexa/db/sqlc"
	"github.com/theosov/hexa/internal/handlers"
	"github.com/theosov/hexa/pkg/auth"
	"github.com/theosov/hexa/pkg/cache"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Unable to ping database: %v\n", err)
	}
	log.Println("✓ Connected to PostgreSQL")

	queries := sqlc.New(pool)

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	redisClient, err := cache.NewRedisClient(redisAddr, os.Getenv("REDIS_PASSWORD"), 0)
	if err != nil {
		log.Fatalf("Unable to connect to Redis: %v\n", err)
	}
	defer redisClient.Close()
	log.Println("✓ Connected to Redis")

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set")
	}
	jwtManager := auth.NewJWTManager(jwtSecret)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:3000"
	}

	googleOAuth := auth.NewGoogleOAuth(
		os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
		os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
		backendURL+"/auth/google/callback",
	)

	githubOAuth := auth.NewGitHubOAuth(
		os.Getenv("GITHUB_OAUTH_CLIENT_ID"),
		os.Getenv("GITHUB_OAUTH_CLIENT_SECRET"),
		backendURL+"/auth/github/callback",
	)

	authHandler := handlers.NewAuthHandler(
		queries,
		jwtManager,
		googleOAuth,
		githubOAuth,
		redisClient,
		frontendURL,
	)

	app := fiber.New(fiber.Config{
		AppName:      "Hexa API v1.0",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     frontendURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "hexa-api",
		})
	})

	app.Get("/swagger/*", swagger.HandlerDefault)

	authGroup := app.Group("/auth")
	authGroup.Get("/google", authHandler.GoogleLogin)
	authGroup.Get("/google/callback", authHandler.GoogleCallback)
	authGroup.Get("/github", authHandler.GitHubLogin)
	authGroup.Get("/github/callback", authHandler.GitHubCallback)
	authGroup.Post("/refresh", authHandler.RefreshToken)

	authMiddleware := auth.AuthMiddleware(jwtManager)

	protected := app.Group("/api", authMiddleware)
	protected.Get("/me", authHandler.GetCurrentUser)
	protected.Post("/logout", authHandler.Logout)

	protected.Get("/ping", func(c *fiber.Ctx) error {
		email := c.Locals("email").(string)
		return c.JSON(fiber.Map{
			"message": "pong",
			"user":    email,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("🚀 Server starting on port %s\n", port)
	log.Printf("📍 Frontend URL: %s\n", frontendURL)
	log.Fatal(app.Listen(":" + port))
}
