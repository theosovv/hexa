import { For } from "solid-js";

import {
  blockDescStyle,
  blockIconStyle,
  blockInfoStyle,
  blockItemStyle,
  blockLabelStyle,
  blocksListStyle,
  headerStyle,
  helpStyle,
  helpTextStyle,
  helpTitleStyle,
  kbdStyle,
  sidebarStyle,
  subtitleStyle,
  titleStyle,
} from "./styles";

import type { AudioBlockType } from "@/audio/types";
import { token } from "@/styled-system/tokens";
import { Horizontal, Vertical } from "@/uikit";


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
    color: token("colors.accent.purple"),
    description: "Sound source",
  },
  {
    type: "filter",
    label: "Filter",
    icon: "🎛️",
    color: token("colors.accent.blue"),
    description: "Shape frequency",
  },
  {
    type: "delay",
    label: "Delay",
    icon: "⏱️",
    color: token("colors.accent.green"),
    description: "Echo effect",
  },
  {
    type: "reverb",
    label: "Reverb",
    icon: "🌊",
    color: token("colors.accent.yellow"),
    description: "Space & depth",
  },
  {
    type: "master",
    label: "Master Out",
    icon: "🔊",
    color: token("colors.accent.red"),
    description: "Final output",
  },
];

const SHORTCUTS = [
  { key: "Space", action: "Play/Pause" },
  { key: "Esc", action: "Close panel" },
  { key: "Ctrl+S", action: "Save track" },
  { key: "Scroll", action: "Zoom canvas" },
  { key: "Shift+Drag", action: "Pan canvas" },
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
        <h3 class={titleStyle}>Audio Blocks</h3>
        <p class={subtitleStyle}>Drag or click to add</p>
      </div>

      <Vertical gap="sm" class={blocksListStyle}>
        <For each={BLOCKS}>
          {(block) => (
            <div
              class={blockItemStyle}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, block.type)}
              onClick={() => props.onAddBlock(block.type)}
              style={{ "border-left-color": block.color }}
            >
              <div class={blockIconStyle}>{block.icon}</div>
              <Vertical gap="xs" class={blockInfoStyle}>
                <div class={blockLabelStyle}>{block.label}</div>
                <div class={blockDescStyle}>{block.description}</div>
              </Vertical>
            </div>
          )}
        </For>
      </Vertical>

      <div class={helpStyle}>
        <div class={helpTitleStyle}>Keyboard Shortcuts</div>
        <Vertical gap="xs">
          <For each={SHORTCUTS}>
            {(shortcut) => (
              <Horizontal gap="sm" justify="between" align="center">
                <kbd class={kbdStyle}>{shortcut.key}</kbd>
                <span class={helpTextStyle}>{shortcut.action}</span>
              </Horizontal>
            )}
          </For>
        </Vertical>
      </div>
    </div>
  );
}
