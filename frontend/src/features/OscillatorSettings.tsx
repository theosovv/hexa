import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Horizontal, Knob, Select, Vertical } from "@/uikit";

export function OscillatorSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number) => void }) {
  const frequency = () => parseFloat(props.node.params.freq as string) || 440;
  const gain = () => ((props.node.params.gain as number) || 0.5) * 100;
  const detune = () => (props.node.params.detune as number) || 0;
  const waveType = () => (props.node.params.type as string) || "sine";

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" align="center" justify="center">
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
          color={token("colors.accent.purple")}
        />

        <Knob
          label="Detune"
          value={detune()}
          min={-100}
          max={100}
          step={1}
          unit="¢"
          onChange={(v) => props.onUpdate("detune", v)}
          color={token("colors.accent.yellow")}
        />

        <Knob
          label="Gain"
          value={gain()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("gain", v / 100)}
          color={token("colors.accent.green")}
        />
      </Horizontal>

      <Select
        label="Wave Type"
        value={waveType()}
        onSelectChange={(v) => props.onUpdate("type", v)}
        options={[
          { value: "sine", label: "Sine Wave" },
          { value: "square", label: "Square Wave" },
          { value: "sawtooth", label: "Sawtooth Wave" },
          { value: "triangle", label: "Triangle Wave" },
        ]}
      />
    </Vertical>
  );
}
