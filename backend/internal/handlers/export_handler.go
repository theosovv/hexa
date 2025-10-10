package handlers

import (
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/gofiber/fiber/v2"
)

type ExportHandler struct{}

func NewExportHandler() *ExportHandler {
	return &ExportHandler{}
}

func (h *ExportHandler) ExportMP3(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("audio")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "audio file missing")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot read file")
	}
	defer file.Close()

	tmpWebm, err := os.CreateTemp("", "recording-*.webm")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot create temp file")
	}
	defer os.Remove(tmpWebm.Name())

	if _, err := io.Copy(tmpWebm, file); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot store recording")
	}
	tmpWebm.Close()

	tmpMp3, err := os.CreateTemp("", "export-*.mp3")
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot create mp3 temp file")
	}
	tmpMp3.Close()
	defer os.Remove(tmpMp3.Name())

	bitrate := c.FormValue("bitrate", "192")
	cmd := exec.Command("ffmpeg",
		"-y",
		"-i", tmpWebm.Name(),
		"-vn",
		"-c:a", "libmp3lame",
		"-b:a", fmt.Sprintf("%sk", bitrate),
		tmpMp3.Name(),
	)
	if output, err := cmd.CombinedOutput(); err != nil {
		fmt.Printf("ffmpeg error: %s\n", string(output))
		return fiber.NewError(fiber.StatusInternalServerError, "encoding failed: "+string(output))
	}

	mp3Data, err := os.ReadFile(tmpMp3.Name())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot read mp3")
	}

	filename := c.FormValue("filename", "track.mp3")
	c.Set(fiber.HeaderContentDisposition, fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Type("mp3")

	return c.Send(mp3Data)
}
