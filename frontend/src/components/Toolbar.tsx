import { css } from "../../styled-system/css";
import { useStudio } from "../contexts/StudioContext";
import { Button } from "../uikit";

export function Toolbar() {
  const studio = useStudio();

  const addOscillator = () => {
    studio.addNode("oscillator", { x: 100, y: 100 + Math.random() * 200 });
  };

  const addMaster = () => {
    studio.addNode("master", { x: 700, y: 200 });
  };

  return (
    <div class={toolbarStyle}>
      <div class={sectionStyle}>
        <h3 class={titleStyle}>🎵 Hexa Studio</h3>
      </div>

      <div class={sectionStyle}>
        <Button
          onClick={studio.togglePlayback}
          variant={studio.isPlaying() ? "danger" : "primary"}
          size="sm"
        >
          {studio.isPlaying() ? "⏸ Stop" : "▶ Play"}
        </Button>
      </div>

      <div class={sectionStyle}>
        <span class={labelStyle}>Add Block:</span>
        <Button onClick={addOscillator} variant="secondary" size="sm">
          + Oscillator
        </Button>
        <Button onClick={addMaster} variant="secondary" size="sm">
          + Master
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
  gap: "24px",
  padding: "0 24px",
  zIndex: 100,
});

const sectionStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

const titleStyle = css({
  color: "white",
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
});

const labelStyle = css({
  color: "#9ca3af",
  fontSize: "14px",
  fontWeight: "500",
});
