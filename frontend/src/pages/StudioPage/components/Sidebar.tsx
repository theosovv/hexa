import { For } from "solid-js";

import { css } from "../../../../styled-system/css";
import type { AudioBlockType } from "../../../audio/types";

interface BlockDefinition {
  type: AudioBlockType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const BLOCKS: BlockDefinition[] = [
  {
    type: "oscillator",
    label: "Oscillator",
    icon: "🎵",
    color: "#8b5cf6",
    description: "Audio generator",
  },
  {
    type: "filter",
    label: "Filter",
    icon: "🎛️",
    color: "#3b82f6",
    description: "Frequency filter",
  },
  {
    type: "delay",
    label: "Delay",
    icon: "⏱️",
    color: "#10b981",
    description: "Echo effect",
  },
  {
    type: "reverb",
    label: "Reverb",
    icon: "🌊",
    color: "#f59e0b",
    description: "Space effect",
  },
  {
    type: "master",
    label: "Master Out",
    icon: "🔊",
    color: "#ef4444",
    description: "Final output",
  },
];

interface SidebarProps {
  onAddBlock: (type: AudioBlockType) => void;
}

export function Sidebar(props: SidebarProps) {
  const handleDragStart = (e: DragEvent, type: AudioBlockType) => {
    e.dataTransfer!.effectAllowed = "copy";
    e.dataTransfer!.setData("blockType", type);
  };

  return (
    <div class={sidebarStyle}>
      <div class={headerStyle}>
        <h3 class={titleStyle}>Blocks</h3>
      </div>

      <div class={blocksListStyle}>
        <For each={BLOCKS}>
          {(block) => (
            <div
              class={blockItemStyle}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, block.type)}
              onClick={() => props.onAddBlock(block.type)}
              style={{ "border-left": `4px solid ${block.color}` }}
            >
              <div class={blockIconStyle}>{block.icon}</div>
              <div class={blockInfoStyle}>
                <div class={blockLabelStyle}>{block.label}</div>
                <div class={blockDescStyle}>{block.description}</div>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class={helpStyle}>
        <div class={helpTitleStyle}>Shortcuts</div>
        <div class={helpItemStyle}>
          <kbd class={kbdStyle}>Space</kbd> Play/Pause
        </div>
        <div class={helpItemStyle}>
          <kbd class={kbdStyle}>Delete</kbd> Remove
        </div>
        <div class={helpItemStyle}>
          <kbd class={kbdStyle}>Esc</kbd> Close panel
        </div>
        <div class={helpItemStyle}>
          <kbd class={kbdStyle}>Ctrl+S</kbd> Save
        </div>
      </div>
    </div>
  );
}

const sidebarStyle = css({
  position: "fixed",
  top: "60px",
  left: 0,
  bottom: 0,
  width: "280px",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(10px)",
  borderRight: "1px solid #3a3a3a",
  display: "flex",
  flexDirection: "column",
  zIndex: 50,
});

const headerStyle = css({
  padding: "24px",
  borderBottom: "1px solid #3a3a3a",
});

const titleStyle = css({
  color: "white",
  fontSize: "16px",
  fontWeight: "700",
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "1px",
});

const blocksListStyle = css({
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const blockItemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  background: "#1a1a1a",
  border: "1px solid #3a3a3a",
  borderRadius: "8px",
  cursor: "grab",
  transition: "all 0.2s",
  userSelect: "none",
  "&:hover": {
    background: "#2a2a2a",
    transform: "translateX(4px)",
  },
  "&:active": {
    cursor: "grabbing",
  },
});

const blockIconStyle = css({
  fontSize: "24px",
});

const blockInfoStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

const blockLabelStyle = css({
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
});

const blockDescStyle = css({
  color: "#6b7280",
  fontSize: "11px",
});

const helpStyle = css({
  padding: "16px",
  borderTop: "1px solid #3a3a3a",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const helpTitleStyle = css({
  color: "#9ca3af",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px",
});

const helpItemStyle = css({
  color: "#6b7280",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

const kbdStyle = css({
  background: "#2a2a2a",
  border: "1px solid #3a3a3a",
  borderRadius: "4px",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#9ca3af",
});
