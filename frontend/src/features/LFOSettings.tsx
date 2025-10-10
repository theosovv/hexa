import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Button, Horizontal, Knob, Select, Vertical } from "@/uikit";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function LFOSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number | boolean) => void }) {
  const frequency = () => clamp(Number(props.node.params.frequency ?? 2), 0.01, 40);
  const depth = () => clamp(Number(props.node.params.depth ?? 0.5), 0, 1) * 100;
  const offset = () => clamp(Number(props.node.params.offset ?? 0.5), -1, 1) * 100;
  const waveform = () => (props.node.params.waveform as string) || "sine";
  const active = () => Boolean(props.node.params.active ?? true);

  const waveOptions = [
    { value: "sine", label: "Sine" },
    { value: "triangle", label: "Triangle" },
    { value: "square", label: "Square" },
    { value: "sawtooth", label: "Sawtooth" },
  ];

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" justify="center" wrap>
        <Knob
          label="Frequency"
          value={frequency()}
          min={0.1}
          max={20}
          step={0.1}
          unit="Hz"
          onChange={(value) => props.onUpdate("frequency", value)}
          color={token("colors.accent.cyan")}
          size={96}
        />

        <Knob
          label="Depth"
          value={depth()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(value) => props.onUpdate("depth", value / 100)}
          color={token("colors.accent.purple")}
          size={96}
        />

        <Knob
          label="Offset"
          value={offset()}
          min={-100}
          max={100}
          step={1}
          unit="%"
          onChange={(value) => props.onUpdate("offset", value / 100)}
          color={token("colors.accent.green")}
          size={96}
        />
      </Horizontal>

      <Vertical gap="lg" align="stretch">
        <Select
          label="Waveform"
          value={waveform()}
          onSelectChange={(value) => props.onUpdate("waveform", value)}
          options={waveOptions}
        />


        <Button
          size="sm"
          variant={active() ? "primary" : "ghost"}
          onClick={() => props.onUpdate("active", !active())}
        >
          Active
        </Button>
      </Vertical>
    </Vertical>
  );
}
