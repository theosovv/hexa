import { css } from "../../styled-system/css";
import { Knob } from "../uikit";

export function MasterSettings(props: { node: any; onUpdate: (key: string, value: any) => void }) {
  const volume = () => (props.node.params.volume || 0.8) * 100;

  return (
    <div class={groupStyle}>
      <div class={knobRowStyle}>
        <Knob
          label="Volume"
          value={volume()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("volume", v / 100)}
          color="#ef4444"
          size={80}
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
