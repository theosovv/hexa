import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Horizontal, Knob } from "@/uikit";

export function ReverbSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number) => void }) {
  const size = () => parseFloat(props.node.params.size as string) || 2.0;
  const decay = () => (props.node.params.decay as number) || 3.0;
  const mix = () => ((props.node.params.mix as number) || 0.3) * 100;

  return (
    <Horizontal gap="lg" align="center" justify="center">
      <Knob
        label="Size"
        value={size()}
        min={0.1}
        max={5.0}
        step={0.1}
        onChange={(v) => props.onUpdate("size", v)}
        color={token("colors.accent.purple")}
      />

      <Knob
        label="Decay"
        value={decay()}
        min={0.1}
        max={10}
        step={0.1}
        unit="s"
        onChange={(v) => props.onUpdate("decay", v)}
        color={token("colors.accent.pink")}
      />

      <Knob
        label="Mix"
        value={mix()}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(v) => props.onUpdate("mix", v / 100)}
        color={token("colors.accent.cyan")}
      />
    </Horizontal>
  );
}
