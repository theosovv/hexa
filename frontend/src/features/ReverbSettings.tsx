import { css } from "../../styled-system/css";
import type { NodeData } from "../canvas/types";
import { Knob } from "../uikit";

export function ReverbSettings(props: { node: NodeData; onUpdate: (key: string, value: any) => void }) {
  const size = () => parseFloat(props.node.params.size as string) || 2.0;
  const decay = () => (props.node.params.decay as number) || 3.0;
  const mix = () => ((props.node.params.mix as number) || 0.3) * 100;

  return (
    <div class={groupStyle}>
      <div class={knobRowStyle}>
        <Knob
          label="Size"
          value={size()}
          min={0.1}
          max={5.0}
          step={0.1}
          onChange={(v) => {
            props.onUpdate("size", v);
            props.onUpdate("size", `${v}`);
          }}
          color="#8b5cf6"
        />

        <Knob
          label="Decay"
          value={decay()}
          min={0.1}
          max={10}
          step={0.1}
          unit="s"
          onChange={(v) => props.onUpdate("decay", v)}
          color="#ec4899"
        />

        <Knob
          label="Mix"
          value={mix()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("mix", v / 100)}
          color="#06b6d4"
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
