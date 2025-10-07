import { css } from "../../styled-system/css";
import type { NodeData } from "../canvas/types";
import { Knob } from "../uikit";

export function DelaySettings(props: { node: NodeData; onUpdate: (key: string, value: any) => void }) {
  const time = () => (parseFloat(props.node.params.time as string) || 0.25) * 1000;
  const feedback = () => ((props.node.params.feedback as number) || 0.3) * 100;
  const mix = () => ((props.node.params.mix as number) || 0.5) * 100;

  return (
    <div class={groupStyle}>
      <div class={knobRowStyle}>
        <Knob
          label="Time"
          value={time()}
          min={10}
          max={2000}
          step={10}
          unit="ms"
          onChange={(v) => {
            props.onUpdate("time", v / 1000);
          }}
          color="#10b981"
        />

        <Knob
          label="Feedback"
          value={feedback()}
          min={0}
          max={95}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("feedback", v / 100)}
          color="#f59e0b"
        />

        <Knob
          label="Mix"
          value={mix()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("mix", v / 100)}
          color="#3b82f6"
        />
      </div>
    </div>
  );
}

const groupStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

const knobRowStyle = css({
  display: "flex",
  gap: "24px",
  justifyContent: "center",
  flexWrap: "wrap",
});
