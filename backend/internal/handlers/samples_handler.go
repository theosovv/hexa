package handlers

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/theosov/hexa/db/sqlc"
	"github.com/theosov/hexa/pkg/storage"
)

type SamplesHandler struct {
	db      *sqlc.Queries
	storage *storage.MinIOClient
}

func NewSamplesHandler(db *sqlc.Queries, storage *storage.MinIOClient) *SamplesHandler {
	return &SamplesHandler{
		db:      db,
		storage: storage,
	}
}

const (
	MaxFileSize  = 10 * 1024 * 1024
	AllowedTypes = "audio/mpeg,audio/wav,audio/ogg,audio/webm"
)

func (h *SamplesHandler) UploadSample(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	trackIDStr := c.FormValue("track_id")
	if trackIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "track_id is required",
		})
	}

	trackID, err := uuid.Parse(trackIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track_id",
		})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "file is required",
		})
	}

	if file.Size > MaxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("file too large (max %dMB)", MaxFileSize/1024/1024),
		})
	}

	contentType := file.Header.Get("Content-Type")
	if !strings.Contains(AllowedTypes, contentType) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid file type (allowed: mp3, wav, ogg, webm)",
		})
	}

	user, err := h.db.GetUser(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to check storage",
		})
	}

	if user.StorageUsed.Int64+file.Size > user.StorageLimit.Int64 {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "storage limit exceeded",
		})
	}

	ext := filepath.Ext(file.Filename)
	s3Key := fmt.Sprintf("samples/%s/%s%s", userID.String(), uuid.New().String(), ext)

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to open file",
		})
	}
	defer src.Close()

	if err := h.storage.UploadFile(c.Context(), s3Key, src, file.Size, contentType); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to upload file",
		})
	}

	sample, err := h.db.CreateSample(c.Context(), sqlc.CreateSampleParams{
		UserID:   uuidToPgtype(userID),
		TrackID:  uuidToPgtype(trackID),
		Filename: file.Filename,
		FileSize: file.Size,
		S3Key:    s3Key,
		MimeType: pgtype.Text{String: contentType, Valid: true},
	})
	if err != nil {
		_ = h.storage.DeleteFile(c.Context(), s3Key)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to save sample",
		})
	}

	if err := h.db.UpdateUserStorage(c.Context(), sqlc.UpdateUserStorageParams{
		ID:          userID,
		StorageUsed: pgtype.Int8{Int64: user.StorageUsed.Int64 + file.Size},
	}); err != nil {
		fmt.Printf("Warning: failed to update storage: %v\n", err)
	}

	url, _ := h.storage.GetPresignedURL(c.Context(), s3Key, 1*time.Hour)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":         sample.ID,
		"filename":   sample.Filename,
		"size":       sample.FileSize,
		"url":        url.String(),
		"created_at": sample.CreatedAt,
	})
}

func (h *SamplesHandler) GetSample(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	sampleID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid sample id",
		})
	}

	sample, err := h.db.GetUserSample(c.Context(), sqlc.GetUserSampleParams{
		ID:     sampleID,
		UserID: uuidToPgtype(userID),
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "sample not found",
		})
	}

	url, err := h.storage.GetPresignedURL(c.Context(), sample.S3Key, 1*time.Hour)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate download url",
		})
	}

	return c.JSON(fiber.Map{
		"id":       sample.ID,
		"filename": sample.Filename,
		"size":     sample.FileSize,
		"url":      url.String(),
	})
}

func (h *SamplesHandler) DeleteSample(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	sampleID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid sample id",
		})
	}

	sample, err := h.db.GetUserSample(c.Context(), sqlc.GetUserSampleParams{
		ID:     sampleID,
		UserID: uuidToPgtype(userID),
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "sample not found",
		})
	}

	if err := h.storage.DeleteFile(c.Context(), sample.S3Key); err != nil {
		fmt.Printf("Warning: failed to delete from storage: %v\n", err)
	}

	if err := h.db.DeleteSample(c.Context(), sqlc.DeleteSampleParams{
		ID:     sampleID,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete sample",
		})
	}

	user, err := h.db.GetUser(c.Context(), userID)
	if err == nil {
		newStorage := user.StorageUsed.Int64 - sample.FileSize
		if newStorage < 0 {
			newStorage = 0
		}
		_ = h.db.UpdateUserStorage(c.Context(), sqlc.UpdateUserStorageParams{
			ID:          userID,
			StorageUsed: pgtype.Int8{Int64: newStorage},
		})
	}

	return c.JSON(fiber.Map{
		"message": "sample deleted",
	})
}

func (h *SamplesHandler) ListTrackSamples(c *fiber.Ctx) error {
	trackID, err := uuid.Parse(c.Params("trackId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track id",
		})
	}

	samples, err := h.db.ListTrackSamples(c.Context(), uuidToPgtype(trackID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch samples",
		})
	}

	result := make([]fiber.Map, 0, len(samples))
	for _, sample := range samples {
		url, _ := h.storage.GetPresignedURL(c.Context(), sample.S3Key, 1*time.Hour)
		result = append(result, fiber.Map{
			"id":       sample.ID,
			"filename": sample.Filename,
			"size":     sample.FileSize,
			"url":      url.String(),
		})
	}

	return c.JSON(result)
}
