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
import { Collapsible, Horizontal, Vertical } from "@/uikit";


interface BlockDefinition {
  type: AudioBlockType;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: "sources" | "effects" | "output";
}

const BLOCKS: BlockDefinition[] = [
  {
    type: "sequencer",
    label: "Sequencer",
    icon: "🎼",
    color: token("colors.accent.blue"),
    description: "Step pattern trigger",
    category: "sources",
  },
  {
    type: "oscillator",
    label: "Oscillator",
    icon: "🎵",
    color: token("colors.accent.purple"),
    description: "Sound generator",
    category: "sources",
  },
  {
    type: "sampler",
    label: "Sampler",
    icon: "🎹",
    color: token("colors.accent.pink"),
    description: "Play audio files",
    category: "sources",
  },
  {
    type: "mixer",
    label: "Mixer",
    icon: "🎚️",
    color: token("colors.accent.yellow"),
    description: "Blend multiple signals",
    category: "effects",
  },
  {
    type: "lfo",
    label: "LFO",
    icon: "🌊",
    color: token("colors.accent.cyan"),
    description: "Modulate parameters",
    category: "effects",
  },
  {
    type: "filter",
    label: "Filter",
    icon: "🎛️",
    color: token("colors.accent.blue"),
    description: "Shape frequency",
    category: "effects",
  },
  {
    type: "delay",
    label: "Delay",
    icon: "⏱️",
    color: token("colors.accent.green"),
    description: "Echo effect",
    category: "effects",
  },
  {
    type: "reverb",
    label: "Reverb",
    icon: "🌊",
    color: token("colors.accent.yellow"),
    description: "Space & depth",
    category: "effects",
  },
  {
    type: "master",
    label: "Master Out",
    icon: "🔊",
    color: token("colors.accent.red"),
    description: "Final output",
    category: "output",
  },
];

const SHORTCUTS = [
  { key: "Space", action: "Play/Pause" },
  { key: "Esc", action: "Close panel" },
  { key: "Ctrl+S", action: "Save track" },
  { key: "Scroll", action: "Zoom canvas" },
  { key: "Shift+Drag", action: "Pan canvas" },
];

const CATEGORIES = [
  { key: "sources", label: "Sources", icon: "🎙️" },
  { key: "effects", label: "Effects", icon: "✨" },
  { key: "output", label: "Output", icon: "🔊" },
] as const;

interface SidebarProps {
  onAddBlock: (type: AudioBlockType) => void;
}

export function Sidebar(props: SidebarProps) {
  const handleDragStart = (e: DragEvent, type: AudioBlockType) => {
    e.dataTransfer!.effectAllowed = "copy";
    e.dataTransfer!.setData("blockType", type);
  };

  const getBlocksByCategory = (category: string) => {
    return BLOCKS.filter((block) => block.category === category);
  };

  return (
    <div class={sidebarStyle}>
      <div class={headerStyle}>
        <h3 class={titleStyle}>Audio Blocks</h3>
        <p class={subtitleStyle}>Drag or click to add</p>
      </div>

      <Vertical class={blocksListStyle}>
        <For each={CATEGORIES}>
          {(category) => (
            <Collapsible
              title={category.label}
              icon={category.icon}
              defaultOpen={category.key === "sources"}
            >
              <For each={getBlocksByCategory(category.key)}>
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
            </Collapsible>
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
