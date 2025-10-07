import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import { css } from "../../../../styled-system/css";
import { useStudio } from "../../../contexts/StudioContext";
import { Button } from "../../../uikit";

export function Toolbar() {
  const studio = useStudio();
  const navigate = useNavigate();

  const handleSave = async () => {
    await studio.saveTrack();
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div class={toolbarStyle}>
      <div class={sectionStyle}>
        <h3 class={logoStyle} onClick={goHome}>🎵 Hexa Studio</h3>
        <Show when={studio.currentTrack()}>
          <span class={trackTitleStyle}>{studio.currentTrack()!.title}</span>
        </Show>
        <Show when={studio.isSaving()}>
          <span class={savingStyle}>Saving...</span>
        </Show>
      </div>

      <div class={sectionStyle}>
        <Button
          onClick={studio.togglePlayback}
          variant={studio.isPlaying() ? "danger" : "primary"}
          size="sm"
        >
          {studio.isPlaying() ? "⏸ Stop" : "▶ Play"}
        </Button>

        <Button onClick={handleSave} variant="secondary" size="sm">
          💾 Save
        </Button>
      </div>
    </div>
  );
}

const toolbarStyle = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "60px",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #3a3a3a",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  padding: "0 24px",
  zIndex: 100,
});

const sectionStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

const logoStyle = css({
  color: "white",
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
  cursor: "pointer",
  transition: "opacity 0.2s",
  "&:hover": {
    opacity: 0.7,
  },
});

const trackTitleStyle = css({
  color: "#9ca3af",
  fontSize: "14px",
  fontWeight: "500",
});

const savingStyle = css({
  color: "#f59e0b",
  fontSize: "12px",
  fontWeight: "600",
});
