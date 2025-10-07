package handlers

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/theosov/hexa/db/sqlc"
)

type TracksHandler struct {
	db *sqlc.Queries
}

func uuidToPgtype(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}
}

func NewTracksHandler(db *sqlc.Queries) *TracksHandler {
	return &TracksHandler{db: db}
}

type CreateTrackRequest struct {
	Title       string      `json:"title"`
	Description string      `json:"description"`
	BPM         int32       `json:"bpm"`
	GraphData   interface{} `json:"graph_data"`
}

type UpdateTrackRequest struct {
	Title       string      `json:"title"`
	Description string      `json:"description"`
	BPM         int32       `json:"bpm"`
	GraphData   interface{} `json:"graph_data"`
}

type TrackResponse struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	IsPublic    bool                   `json:"is_public"`
	BPM         int32                  `json:"bpm"`
	GraphData   map[string]interface{} `json:"graph_data"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
}

func trackToResponse(track sqlc.Track) (*TrackResponse, error) {
	var graphData map[string]interface{}
	if err := json.Unmarshal(track.GraphData, &graphData); err != nil {
		return nil, err
	}

	description := ""
	if track.Description.Valid {
		description = track.Description.String
	}

	bpm := int32(120)
	if track.Bpm.Valid {
		bpm = track.Bpm.Int32
	}

	return &TrackResponse{
		ID:          track.ID.String(),
		UserID:      track.UserID.String(),
		Title:       track.Title,
		Description: description,
		IsPublic:    track.IsPublic.Bool,
		BPM:         bpm,
		GraphData:   graphData,
		CreatedAt:   track.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   track.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (h *TracksHandler) ListTracks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	tracks, err := h.db.ListUserTracks(c.Context(), uuidToPgtype(userID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch tracks",
		})
	}

	response := make([]TrackResponse, 0, len(tracks))
	for _, track := range tracks {
		tr, err := trackToResponse(track)
		if err != nil {
			continue
		}
		response = append(response, *tr)
	}

	return c.JSON(response)
}

func (h *TracksHandler) GetTrack(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	trackID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track id",
		})
	}

	track, err := h.db.GetUserTrack(c.Context(), sqlc.GetUserTrackParams{
		ID:     trackID,
		UserID: uuidToPgtype(userID),
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "track not found",
		})
	}

	response, err := trackToResponse(track)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to serialize track",
		})
	}

	return c.JSON(response)
}

func (h *TracksHandler) CreateTrack(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req CreateTrackRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	graphJSON, err := json.Marshal(req.GraphData)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid graph data",
		})
	}

	bpm := req.BPM
	if bpm == 0 {
		bpm = 120
	}

	track, err := h.db.CreateTrack(c.Context(), sqlc.CreateTrackParams{
		UserID: uuidToPgtype(userID),
		Title:  req.Title,
		Description: pgtype.Text{
			String: req.Description,
			Valid:  req.Description != "",
		},
		Bpm: pgtype.Int4{
			Int32: bpm,
			Valid: true,
		},
		GraphData: graphJSON,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create track",
		})
	}

	response, err := trackToResponse(track)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to serialize track",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

func (h *TracksHandler) UpdateTrack(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	trackID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track id",
		})
	}

	var req UpdateTrackRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	graphJSON, err := json.Marshal(req.GraphData)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid graph data",
		})
	}

	track, err := h.db.UpdateTrack(c.Context(), sqlc.UpdateTrackParams{
		ID:    trackID,
		Title: req.Title,
		Description: pgtype.Text{
			String: req.Description,
			Valid:  req.Description != "",
		},
		Bpm:       pgtype.Int4{Int32: req.BPM, Valid: true},
		GraphData: graphJSON,
		UserID:    uuidToPgtype(userID),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to update track",
		})
	}

	response, err := trackToResponse(track)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to serialize track",
		})
	}

	return c.JSON(response)
}

func (h *TracksHandler) UpdateTrackGraph(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	trackID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track id",
		})
	}

	var req struct {
		GraphData interface{} `json:"graph_data"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	graphJSON, err := json.Marshal(req.GraphData)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid graph data",
		})
	}

	track, err := h.db.UpdateTrackGraph(c.Context(), sqlc.UpdateTrackGraphParams{
		ID:        trackID,
		GraphData: graphJSON,
		UserID:    uuidToPgtype(userID),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to update track graph",
		})
	}

	response, err := trackToResponse(track)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to serialize track",
		})
	}

	return c.JSON(response)
}

func (h *TracksHandler) DeleteTrack(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	trackID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid track id",
		})
	}

	if err := h.db.DeleteTrack(c.Context(), sqlc.DeleteTrackParams{
		ID:     trackID,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete track",
		})
	}

	return c.JSON(fiber.Map{
		"message": "track deleted",
	})
}
