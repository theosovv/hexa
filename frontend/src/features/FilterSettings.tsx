import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Horizontal, Knob, Select, Vertical } from "@/uikit";

export function FilterSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number) => void }) {
  const frequency = () => parseFloat(props.node.params.cutoff as string) || 1000;
  const q = () => (props.node.params.q as number) || 1;
  const gain = () => (props.node.params.gain as number) || 0;
  const filterType = () => (props.node.params.type as string) || "lowpass";

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" align="center" justify="center">
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
          color={token("colors.accent.blue")}
        />

        <Knob
          label="Resonance"
          value={q()}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(v) => props.onUpdate("q", v)}
          color={token("colors.accent.cyan")}
        />

        <Knob
          label="Gain"
          value={gain()}
          min={-40}
          max={40}
          step={1}
          unit="dB"
          onChange={(v) => props.onUpdate("gain", v)}
          color={token("colors.accent.green")}
        />
      </Horizontal>

      <Select
        label="Filter Type"
        value={filterType()}
        onSelectChange={(v) => props.onUpdate("type", v)}
        options={[
          { value: "lowpass", label: "Lowpass" },
          { value: "highpass", label: "Highpass" },
          { value: "bandpass", label: "Bandpass" },
          { value: "lowshelf", label: "Lowshelf" },
          { value: "highshelf", label: "Highshelf" },
          { value: "peaking", label: "Peaking" },
          { value: "notch", label: "Notch" },
        ]}
      />
    </Vertical>
  );
}
