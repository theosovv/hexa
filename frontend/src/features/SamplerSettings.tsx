import { For, onMount, Show } from "solid-js";
import { createSignal } from "solid-js";

import { apiClient } from "@/api/client";
import type { Sample } from "@/api/types/sample";
import type { NodeData } from "@/canvas/types";
import { useStudio } from "@/contexts/StudioContext";
import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";
import { Button, FileUpload, Horizontal, Knob, Vertical } from "@/uikit";

export function SamplerSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number | boolean) => void }) {
  const studio = useStudio();

  const [samples, setSamples] = createSignal<Sample[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = createSignal(false);

  const gain = () => ((props.node.params.gain as number) || 0.8) * 100;
  const playbackRate = () => (props.node.params.playbackRate as number) || 1.0;
  const loop = () => (props.node.params.loop as boolean) || false;
  const currentSampleUrl = () => props.node.params.sampleUrl as string | null;

  const loadSamples = async () => {
    const trackId = studio.currentTrack()?.id;
    if (!trackId) return;

    setIsLoadingSamples(true);
    try {
      const data = await apiClient.listTrackSamples(trackId);
      setSamples(data);
    } catch (error) {
      console.error("Failed to load samples:", error);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  onMount(() => {
    loadSamples();
  });

  const handleUpload = async (file: File) => {
    const trackId = studio.currentTrack()?.id;
    if (!trackId) throw new Error("No track selected");

    const sample = await apiClient.uploadSample(trackId, file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });

    setSamples([sample, ...samples()]);

    await handleSelectSample(sample);
  };

  const handleSelectSample = async (sample: Sample) => {
    const block = studio.audioGraph.getBlock(props.node.id);
    if (block && "loadSample" in block) {
      try {
        await (block as any).loadSample(sample.url);
        props.onUpdate("sampleUrl", sample.url);
        props.onUpdate("sampleName", sample.filename);
      } catch (error) {
        console.error("Failed to load sample:", error);
      }
    }
  };

  const handleTrigger = () => {
    const block = studio.audioGraph.getBlock(props.node.id);
    if (block && "trigger" in block) {
      (block as any).trigger();
    }
  };

  const handleStop = () => {
    const block = studio.audioGraph.getBlock(props.node.id);
    if (block && "stop" in block) {
      (block as any).stop();
    }
  };

  const toggleLoop = () => {
    const newLoop = !loop();
    props.onUpdate("loop", newLoop);
  };

  return (
    <Vertical gap="xl" fullWidth>
      <Vertical gap="md" fullWidth>
        <div class={sectionTitleStyle}>Upload Sample</div>
        <FileUpload
          accept="audio/*"
          maxSize={10 * 1024 * 1024}
          onUpload={handleUpload}
        />
      </Vertical>

      <Show when={samples().length > 0}>
        <Vertical gap="md" fullWidth>
          <div class={sectionTitleStyle}>Your Samples</div>
          <div class={samplesListStyle}>
            <For each={samples()}>
              {(sample) => (
                <div
                  class={sampleItemStyle}
                  classList={{ [activeSampleStyle]: currentSampleUrl() === sample.url }}
                  onClick={() => handleSelectSample(sample)}
                >
                  <div class={sampleIconStyle}>🎵</div>
                  <Vertical gap="xs" class={sampleInfoStyle}>
                    <div class={sampleNameStyle}>{sample.filename}</div>
                    <div class={sampleSizeStyle}>
                      {(sample.size / 1024).toFixed(0)} KB
                    </div>
                  </Vertical>
                </div>
              )}
            </For>
          </div>
        </Vertical>
      </Show>

      <Show when={currentSampleUrl()}>
        <Vertical gap="md" fullWidth>
          <div class={sectionTitleStyle}>Playback</div>
          <Horizontal gap="sm" justify="center">
            <Button
              onClick={toggleLoop}
              variant={loop() ? "primary" : "secondary"}
              size="sm"
            >
              🔁 Loop
            </Button>
          </Horizontal>
        </Vertical>
      </Show>

      <Show when={currentSampleUrl()}>
        <Horizontal gap="lg" align="center" justify="center">
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

          <Knob
            label="Speed"
            value={playbackRate() * 100}
            min={25}
            max={200}
            step={5}
            unit="%"
            onChange={(v) => props.onUpdate("playbackRate", v / 100)}
            color={token("colors.accent.blue")}
          />
        </Horizontal>
      </Show>
    </Vertical>
  );
}

const sectionTitleStyle = css({
  fontSize: token("fontSizes.xs"),
  fontWeight: "700",
  color: token("colors.text.secondary"),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const samplesListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: token("spacing.xs"),
  maxHeight: "200px",
  overflowY: "auto",
});

const sampleItemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.sm"),
  padding: token("spacing.sm"),
  background: token("colors.surface.secondary"),
  border: `1px solid ${token("colors.border.primary")}`,
  borderRadius: token("radii.md"),
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: token("colors.surface.hover"),
    borderColor: token("colors.border.secondary"),
  },
});

const activeSampleStyle = css({
  borderColor: token("colors.border.accent"),
  background: "rgba(139, 92, 246, 0.1)",
});

const sampleIconStyle = css({
  fontSize: token("fontSizes.xl"),
});

const sampleInfoStyle = css({
  flex: 1,
  minWidth: 0,
});

const sampleNameStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const sampleSizeStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});
