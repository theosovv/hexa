import { For } from "solid-js";

import { css } from "../../styled-system/css";
import { useStudio } from "../contexts/StudioContext";
import { Button } from "../uikit";

export function Toolbar() {
  const studio = useStudio();

  const blocks = [
    { type: "oscillator", label: "Oscillator", icon: "🎵" },
    { type: "filter", label: "Filter", icon: "🎛️" },
    { type: "delay", label: "Delay", icon: "⏱️" },
    { type: "reverb", label: "Reverb", icon: "🌊" },
    { type: "master", label: "Master", icon: "🔊" },
  ] as const;

  const addBlock = (type: string) => {
    const x = 100 + Math.random() * 400;
    const y = 100 + Math.random() * 300;

    studio.addNode(type as any, { x, y });
  };

  return (
    <div class={toolbarStyle}>
      {/* Left section - Logo & Transport */}
      <div class={sectionStyle}>
        <h3 class={titleStyle}>🎵 Hexa Studio</h3>
        <Button
          onClick={studio.togglePlayback}
          variant={studio.isPlaying() ? "danger" : "primary"}
          size="sm"
        >
          {studio.isPlaying() ? "⏸ Stop" : "▶ Play"}
        </Button>
      </div>

      {/* Right section - Add blocks */}
      <div class={sectionStyle}>
        <span class={labelStyle}>Add Block:</span>
        <For each={blocks}>{(block) => (
          <Button
            onClick={() => addBlock(block.type)}
            variant="secondary"
            size="sm"
          >
            {block.icon} {block.label}
          </Button>
        )}</For>
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
