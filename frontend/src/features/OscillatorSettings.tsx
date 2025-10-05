import { css } from "../../styled-system/css";
import { Knob } from "../uikit";

export function OscillatorSettings(props: { node: any; onUpdate: (key: string, value: any) => void }) {
  const frequency = () => parseFloat(props.node.params.freq) || 440;
  const gain = () => (props.node.params.gain || 0.5) * 100;
  const detune = () => props.node.params.detune || 0;
  const waveType = () => props.node.params.type || "sine";

  return (
    <div class={groupStyle}>
      <div class={knobRowStyle}>
        <Knob
          label="Frequency"
          value={frequency()}
          min={20}
          max={2000}
          step={1}
          unit="Hz"
          onChange={(v) => {
            props.onUpdate("freq", `${v}Hz`);
            props.onUpdate("frequency", v);
          }}
          color="#8b5cf6"
        />

        <Knob
          label="Detune"
          value={detune()}
          min={-100}
          max={100}
          step={1}
          unit="¢"
          onChange={(v) => props.onUpdate("detune", v)}
          color="#f59e0b"
        />

        <Knob
          label="Gain"
          value={gain()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("gain", v / 100)}
          color="#10b981"
        />
      </div>

      <div class={fieldStyle}>
        <label class={labelStyle}>Wave Type</label>
        <select
          class={selectStyle}
          value={waveType()}
          onChange={(e) => props.onUpdate("type", e.currentTarget.value)}
        >
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
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
