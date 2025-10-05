import { css } from "../../styled-system/css";
import type { NodeData } from "../canvas/types";
import { Knob } from "../uikit";

export function FilterSettings(props: { node: NodeData; onUpdate: (key: string, value: any) => void }) {
  const frequency = () => parseFloat(props.node.params.cutoff as string) || 1000;
  const q = () => (props.node.params.q as number) || 1;
  const gain = () => (props.node.params.gain as number) || 0;
  const filterType = () => (props.node.params.type as string) || "lowpass";

  return (
    <div class={groupStyle}>
      <div class={knobRowStyle}>
        <Knob
          label="Frequency"
          value={frequency()}
          min={20}
          max={20000}
          step={10}
          unit="Hz"
          onChange={(v) => {
            props.onUpdate("cutoff", `${v}Hz`);
            props.onUpdate("frequency", v);
          }}
          color="#3b82f6"
        />

        <Knob
          label="Q (Resonance)"
          value={q()}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(v) => props.onUpdate("q", v)}
          color="#06b6d4"
        />

        <Knob
          label="Gain"
          value={gain()}
          min={-40}
          max={40}
          step={1}
          unit="dB"
          onChange={(v) => props.onUpdate("gain", v)}
          color="#10b981"
        />
      </div>

      <div class={fieldStyle}>
        <label class={labelStyle}>Filter Type</label>
        <select
          class={selectStyle}
          value={filterType()}
          onChange={(e) => props.onUpdate("type", e.currentTarget.value)}
        >
          <option value="lowpass">Lowpass</option>
          <option value="highpass">Highpass</option>
          <option value="bandpass">Bandpass</option>
          <option value="lowshelf">Lowshelf</option>
          <option value="highshelf">Highshelf</option>
          <option value="peaking">Peaking</option>
          <option value="notch">Notch</option>
        </select>
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

const fieldStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const labelStyle = css({
  fontSize: "12px",
  fontWeight: "600",
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const selectStyle = css({
  padding: "12px 16px",
  background: "#2a2a2a",
  border: "1px solid #3a3a3a",
  borderRadius: "8px",
  color: "white",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: "#3a3a3a",
    borderColor: "#4a4a4a",
  },
  "&:focus": {
    outline: "none",
    borderColor: "#4a9eff",
  },
});


