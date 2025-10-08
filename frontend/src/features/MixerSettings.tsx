import { For } from "solid-js";

import type { NodeData } from "@/canvas/types";
import { Button, Horizontal, Input, Knob, Slider, Vertical } from "@/uikit";
import { token } from "@/styled-system/tokens";

const CHANNEL_LIMIT = { min: 1, max: 12 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function MixerSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number | boolean) => void }) {
  const channels = () => clamp(Number(props.node.params.channels ?? 4), CHANNEL_LIMIT.min, CHANNEL_LIMIT.max);
  const master = () => clamp(Number(props.node.params.master ?? 1), 0, 2) * 100;

  const channelGain = (index: number) => {
    const raw = Number(props.node.params[`gain_${index}`] ?? 1);
    return clamp(raw, 0, 2) * 100;
  };

  const setChannelCount = (next: number) => {
    const clamped = clamp(Math.round(next), CHANNEL_LIMIT.min, CHANNEL_LIMIT.max);
    props.onUpdate("channels", clamped);
  };

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" align="center" justify="center">
        <Knob
          label="Master"
          value={master()}
          min={0}
          max={200}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("master", v / 100)}
          color={token("colors.accent.yellow")}
          size={96}
        />

        <Vertical gap="sm" align="stretch">
          <Input
            type="number"
            label="Channels"
            min={CHANNEL_LIMIT.min}
            max={CHANNEL_LIMIT.max}
            value={channels().toString()}
            onInput={(event) => {
              const parsed = parseInt(event.currentTarget.value, 10);
              if (!Number.isNaN(parsed)) {
                setChannelCount(parsed);
              }
            }}
          />

          <Horizontal gap="sm" justify="between">
            <Button size="sm" variant="secondary" onClick={() => setChannelCount(channels() - 1)} disabled={channels() <= CHANNEL_LIMIT.min}>
              −1
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setChannelCount(channels() + 1)} disabled={channels() >= CHANNEL_LIMIT.max}>
              +1
            </Button>
          </Horizontal>
        </Vertical>
      </Horizontal>

      <Horizontal gap="md" justify="center" fullWidth wrap>
        <For each={Array.from({ length: channels() }, (_, index) => index)}>
          {(index) => (
            <Slider
              label={`CH ${index + 1}`}
              value={channelGain(index)}
              min={0}
              max={200}
              step={1}
              unit="%"
              orientation="vertical"
              color={token("colors.accent.yellow")}
              onChange={(value) => props.onUpdate(`gain_${index}`, value / 100)}
            />
          )}
        </For>
      </Horizontal>
    </Vertical>
  );
}
