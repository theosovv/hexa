import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Knob, Vertical } from "@/uikit";

export function MasterSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number) => void }) {
  const volume = () => ((props.node.params.volume as number) || 0.8) * 100;
  const clipThreshold = () => (props.node.params.clipThreshold as number) ?? 0.8;

  return (
    <Vertical gap="lg" align="center">
      <Knob
        label="Volume"
        value={volume()}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(v) => props.onUpdate("volume", v / 100)}
        color={token("colors.accent.red")}
        size={100}
      />
      <Knob
        label="Soft Clip"
        value={clipThreshold()}
        min={0.5}
        max={2}
        step={0.05}
        onChange={(v) => props.onUpdate("clipThreshold", v)}
        color={token("colors.accent.yellow")}
        size={90}
      />
    </Vertical>
  );
}
