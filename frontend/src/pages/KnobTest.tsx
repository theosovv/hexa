import { createSignal } from "solid-js";

import { css } from "../../styled-system/css";
import { Knob, Slider } from "../uikit";

export function KnobTestPage() {
  const [frequency, setFrequency] = createSignal(440);
  const [gain, setGain] = createSignal(50);
  const [detune, setDetune] = createSignal(0);
  const [volume, setVolume] = createSignal(80);
  const [pan, setPan] = createSignal(50);

  return (
    <div class={containerStyle}>
      <h1 class={titleStyle}>UI Controls Test</h1>

      <div class={sectionStyle}>
        <h2 class={subtitleStyle}>Knobs</h2>
        <div class={knobsStyle}>
          <Knob
            label="Frequency"
            value={frequency()}
            min={20}
            max={2000}
            step={1}
            unit="Hz"
            onChange={setFrequency}
            color="#8b5cf6"
          />

          <Knob
            label="Gain"
            value={gain()}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={setGain}
            color="#10b981"
          />

          <Knob
            label="Detune"
            value={detune()}
            min={-100}
            max={100}
            step={1}
            unit="¢"
            onChange={setDetune}
            color="#f59e0b"
          />
        </div>
      </div>

      <div class={sectionStyle}>
        <h2 class={subtitleStyle}>Sliders</h2>
        <div class={slidersStyle}>
          <Slider
            label="Volume"
            value={volume()}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={setVolume}
            orientation="vertical"
            color="#ef4444"
          />

          <Slider
            label="Pan"
            value={pan()}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={setPan}
            orientation="vertical"
            color="#3b82f6"
          />

          <div class={horizontalSliderStyle}>
            <Slider
              label="Master"
              value={volume()}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={setVolume}
              orientation="horizontal"
              color="#f59e0b"
            />
          </div>
        </div>
      </div>

      <div class={infoStyle}>
        <p>Frequency: {frequency()} Hz</p>
        <p>Gain: {gain()} %</p>
        <p>Detune: {detune()} cents</p>
        <p>Volume: {volume()} %</p>
        <p>Pan: {pan()} %</p>
      </div>
    </div>
  );
}

const containerStyle = css({
  padding: "48px",
  minHeight: "100vh",
  background: "#0a0a0a",
});

const titleStyle = css({
  color: "white",
  fontSize: "32px",
  fontWeight: "bold",
  marginBottom: "48px",
});

const subtitleStyle = css({
  color: "white",
  fontSize: "24px",
  fontWeight: "600",
  marginBottom: "24px",
});

const sectionStyle = css({
  marginBottom: "64px",
});

const knobsStyle = css({
  display: "flex",
  gap: "48px",
  justifyContent: "center",
});

const slidersStyle = css({
  display: "flex",
  gap: "48px",
  justifyContent: "center",
  alignItems: "flex-start",
});

const horizontalSliderStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const infoStyle = css({
  color: "white",
  fontSize: "18px",
  textAlign: "center",
  "& p": {
    margin: "8px 0",
  },
});
