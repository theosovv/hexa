import { createMemo, For } from "solid-js";

import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Button, Horizontal, Input, Knob, Slider, Vertical } from "@/uikit";
interface SequencerStep {
  active: boolean;
  velocity: number;
  probability?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function SequencerSettings(props: {
  node: NodeData;
  onUpdate: (key: string, value: string | number | boolean | SequencerStep[]) => void;
}) {
  const params = () => props.node.params;

  const bpm = () => clamp(Number(params().bpm ?? 120), 20, 300);
  const stepsPerBar = () => clamp(Number(params().stepsPerBar ?? 16), 1, 64);
  const swing = () => clamp(Number(params().swing ?? 0), 0, 0.5);

  const steps = createMemo<SequencerStep[]>(() => {
    const raw = params().steps;
    if (Array.isArray(raw)) {
      return raw.map((step) => ({
        active: Boolean(step?.active),
        velocity: clamp(Number(step?.velocity ?? 1), 0, 1),
        probability: clamp(Number(step?.probability ?? 1), 0, 1),
      }));
    }
    return Array.from({ length: 16 }, (_, index) => ({
      active: index % 4 === 0,
      velocity: 1,
      probability: 1,
    }));
  });

  const toggleStep = (index: number) => {
    const next = steps().map((step, i) =>
      i === index ? { ...step, active: !step.active } : step,
    );
    props.onUpdate("steps", next);
  };

  const setVelocity = (index: number, value: number) => {
    const next = steps().map((step, i) =>
      i === index ? { ...step, velocity: clamp(value, 0, 1) } : step,
    );
    props.onUpdate("steps", next);
  };

  const setProbability = (index: number, value: number) => {
    const next = steps().map((step, i) =>
      i === index ? { ...step, probability: clamp(value, 0, 1) } : step,
    );
    props.onUpdate("steps", next);
  };

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" justify="center" wrap>
        <Knob
          label="Tempo"
          value={bpm()}
          min={40}
          max={220}
          step={1}
          unit="BPM"
          onChange={(value) => props.onUpdate("bpm", value)}
          color={token("colors.accent.blue")}
          size={96}
        />

        <Knob
          label="Swing"
          value={swing() * 100}
          min={0}
          max={50}
          step={1}
          unit="%"
          onChange={(value) => props.onUpdate("swing", value / 100)}
          color={token("colors.accent.purple")}
          size={96}
        />

        <Vertical gap="sm" align="stretch">
          <label style={{ "font-size": "12px", "font-weight": "600", "text-transform": "uppercase", color: "#9ca3af" }}>
            Steps per bar
          </label>
          <Input
            type="number"
            value={stepsPerBar().toString()}
            min={1}
            max={64}
            class="sequencer-input"
            onInput={(event) => {
              const parsed = Number(event.currentTarget.value);
              if (Number.isFinite(parsed)) {
                props.onUpdate("stepsPerBar", clamp(parsed, 1, 64));
              }
            }}
          />
        </Vertical>
      </Horizontal>

      <Vertical gap="md">
        <Horizontal gap="xs" wrap justify="center">
          <For each={steps()}>
            {(step, index) => (
              <Button
                size="sm"
                variant={step.active ? "primary" : "ghost"}
                onClick={() => toggleStep(index())}
              >
                {index() + 1}
              </Button>
            )}
          </For>
        </Horizontal>

        <Horizontal gap="md" justify="center" wrap>
          <For each={steps()}>
            {(step, index) => (
              <Vertical align="center" gap="xs">
                <Slider
                  label="Vel"
                  value={Math.round(step.velocity * 100)}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  orientation="vertical"
                  color={token("colors.accent.blue")}
                  onChange={(value) => setVelocity(index(), value / 100)}
                />
                <Slider
                  label="Prob"
                  value={Math.round((step.probability ?? 1) * 100)}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  orientation="vertical"
                  color={token("colors.accent.green")}
                  onChange={(value) => setProbability(index(), value / 100)}
                />
              </Vertical>
            )}
          </For>
        </Horizontal>
      </Vertical>
    </Vertical>
  );
}
