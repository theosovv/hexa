import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Horizontal, Knob } from "@/uikit";


export function DelaySettings(props: { node: NodeData; onUpdate: (key: string, value: string | number) => void }) {
  const time = () => (parseFloat(props.node.params.time as string) || 0.25) * 1000;
  const feedback = () => ((props.node.params.feedback as number) || 0.3) * 100;
  const mix = () => ((props.node.params.mix as number) || 0.5) * 100;

  return (
    <Horizontal gap="lg" align="center" justify="center">
      <Knob
        label="Time"
        value={time()}
        min={10}
        max={2000}
        step={10}
        unit="ms"
        onChange={(v) => props.onUpdate("time", v / 1000)}
        color={token("colors.accent.green")}
      />

      <Knob
        label="Feedback"
        value={feedback()}
        min={0}
        max={95}
        step={1}
        unit="%"
        onChange={(v) => props.onUpdate("feedback", v / 100)}
        color={token("colors.accent.yellow")}
      />

      <Knob
        label="Mix"
        value={mix()}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(v) => props.onUpdate("mix", v / 100)}
        color={token("colors.accent.blue")}
      />
    </Horizontal>
  );
}
