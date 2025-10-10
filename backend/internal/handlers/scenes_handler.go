package handlers

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/theosov/hexa/db/sqlc"
)

type SceneState struct {
	NodeParams   map[string]map[string]interface{} `json:"nodeParams"`
	MutedNodeIDs []string                          `json:"mutedNodeIds"`
}

type SceneResponse struct {
	ID        uuid.UUID  `json:"id"`
	TrackID   uuid.UUID  `json:"track_id"`
	Name      string     `json:"name"`
	StateData SceneState `json:"state_data"`
	Position  int32      `json:"position"`
	CreatedAt string     `json:"created_at"`
}

type CreateSceneRequest struct {
	Name      string     `json:"name"`
	Position  *int32     `json:"position,omitempty"`
	StateData SceneState `json:"state_data"`
}

type UpdateSceneRequest struct {
	Name      *string    `json:"name,omitempty"`
	Position  *int32     `json:"position,omitempty"`
	StateData SceneState `json:"state_data"`
}

type ScenesHandler struct {
	db *sqlc.Queries
}

func NewScenesHandler(db *sqlc.Queries) *ScenesHandler {
	return &ScenesHandler{db: db}
}

func (h *ScenesHandler) ListScenes(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	trackID, err := uuid.Parse(c.Params("trackId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid track id")
	}

	if _, err := h.db.GetUserTrack(c.Context(), sqlc.GetUserTrackParams{
		ID:     trackID,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "track not found")
	}

	rows, err := h.db.ListScenesByTrack(c.Context(), uuidToPgtype(trackID))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to list scenes")
	}

	resp := make([]SceneResponse, 0, len(rows))
	for _, row := range rows {
		var state SceneState
		if len(row.StateData) > 0 {
			if err := json.Unmarshal(row.StateData, &state); err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "failed to decode scene state")
			}
		}
		resp = append(resp, SceneResponse{
			ID:        row.ID,
			TrackID:   trackID,
			Name:      row.Name,
			StateData: state,
			Position:  row.Position.Int32,
			CreatedAt: row.CreatedAt.Time.Format(time.RFC3339),
		})
	}

	return c.JSON(resp)
}

func (h *ScenesHandler) CreateScene(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	trackID, err := uuid.Parse(c.Params("trackId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid track id")
	}

	if _, err := h.db.GetUserTrack(c.Context(), sqlc.GetUserTrackParams{
		ID:     trackID,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "track not found")
	}

	var req CreateSceneRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}

	stateJSON, err := json.Marshal(req.StateData)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid scene state")
	}

	position := int32(0)
	if req.Position != nil {
		position = *req.Position
	} else {
		existing, err := h.db.ListScenesByTrack(c.Context(), uuidToPgtype(trackID))
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to determine scene position")
		}
		position = int32(len(existing))
	}

	sceneID := uuid.New()
	row, err := h.db.CreateScene(c.Context(), sqlc.CreateSceneParams{
		ID:        sceneID,
		TrackID:   uuidToPgtype(trackID),
		Name:      req.Name,
		StateData: stateJSON,
		Position:  pgtype.Int4{Int32: position, Valid: true},
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create scene")
	}

	return c.Status(fiber.StatusCreated).JSON(SceneResponse{
		ID:        row.ID,
		TrackID:   trackID,
		Name:      row.Name,
		Position:  row.Position.Int32,
		StateData: req.StateData,
		CreatedAt: row.CreatedAt.Time.Format(time.RFC3339),
	})
}

func (h *ScenesHandler) UpdateScene(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	sceneID, err := uuid.Parse(c.Params("sceneId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid scene id")
	}

	sceneRow, err := h.db.GetScene(c.Context(), sceneID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "scene not found")
	}

	if _, err := h.db.GetUserTrack(c.Context(), sqlc.GetUserTrackParams{
		ID:     sceneRow.TrackID.Bytes,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return fiber.NewError(fiber.StatusForbidden, "access denied")
	}

	var req UpdateSceneRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}

	stateJSON, err := json.Marshal(req.StateData)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid scene state")
	}

	name := sceneRow.Name
	if req.Name != nil && *req.Name != "" {
		name = *req.Name
	}

	position := sceneRow.Position.Int32
	if req.Position != nil {
		position = *req.Position
	}

	row, err := h.db.UpdateScene(c.Context(), sqlc.UpdateSceneParams{
		ID:        sceneID,
		Name:      name,
		StateData: stateJSON,
		Position:  pgtype.Int4{Int32: position, Valid: true},
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to update scene")
	}

	return c.JSON(SceneResponse{
		ID:        row.ID,
		TrackID:   row.TrackID.Bytes,
		Name:      row.Name,
		Position:  row.Position.Int32,
		StateData: req.StateData,
		CreatedAt: row.CreatedAt.Time.Format(time.RFC3339),
	})
}

func (h *ScenesHandler) DeleteScene(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	sceneID, err := uuid.Parse(c.Params("sceneId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid scene id")
	}

	sceneRow, err := h.db.GetScene(c.Context(), sceneID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "scene not found")
	}

	if _, err := h.db.GetUserTrack(c.Context(), sqlc.GetUserTrackParams{
		ID:     sceneRow.TrackID.Bytes,
		UserID: uuidToPgtype(userID),
	}); err != nil {
		return fiber.NewError(fiber.StatusForbidden, "access denied")
	}

	if err := h.db.DeleteScene(c.Context(), sceneID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to delete scene")
	}

	return c.SendStatus(fiber.StatusNoContent)
}
