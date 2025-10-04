package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	client *redis.Client
}

func NewRedisClient(addr string, password string, db int) (*RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &RedisClient{client: client}, nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value string, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

func (r *RedisClient) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

func (r *RedisClient) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.client.Exists(ctx, key).Result()
	return count > 0, err
}

func (r *RedisClient) Close() error {
	return r.client.Close()
}

func (r *RedisClient) SetOAuthState(ctx context.Context, state string, userAgent string) error {
	key := "oauth_state:" + state
	return r.Set(ctx, key, userAgent, 10*time.Minute)
}

func (r *RedisClient) VerifyOAuthState(ctx context.Context, state string) (bool, error) {
	key := "oauth_state:" + state
	exists, err := r.Exists(ctx, key)
	if err != nil {
		return false, err
	}

	if exists {
		_ = r.Delete(ctx, key)
	}

	return exists, nil
}
