import { Show, For, onMount, createSignal } from "solid-js";

import type { NodeData } from "@/canvas/types";
import { token } from "@/styled-system/tokens";
import { Button, FileUpload, Horizontal, Knob, Vertical } from "@/uikit";
import { css } from "@/styled-system/css";
import { useStudio } from "@/contexts/StudioContext";
import type { ImpulseResponse } from "@/api/types/impulse";
import { apiClient } from "@/api/client";

export function ReverbSettings(props: { node: NodeData; onUpdate: (key: string, value: string | number | boolean) => void }) {
  const studio = useStudio();

  const size = () => parseFloat(props.node.params.size as string) || 2.0;
  const decay = () => (props.node.params.decay as number) || 3.0;
  const mix = () => ((props.node.params.mix as number) || 0.3) * 100;
  const normalize = () => (props.node.params.normalize as boolean) ?? true;
  const currentImpulseId = () => (props.node.params.impulseId as string) || "";
  const currentImpulseName = () => (props.node.params.impulseName as string) || "";
  const currentImpulseUrl = () => (props.node.params.impulseUrl as string) || "";

  const [impulses, setImpulses] = createSignal<ImpulseResponse[]>([]);
  const [isLoadingList, setIsLoadingList] = createSignal(false);
  const [isApplyingImpulse, setIsApplyingImpulse] = createSignal(false);
  const [manualUrl, setManualUrl] = createSignal(currentImpulseUrl());
  const [uploadProgress, setUploadProgress] = createSignal(0);

  const block = () => studio.audioGraph.getBlock(props.node.id) as any;

  const loadImpulses = async () => {
    const trackId = studio.currentTrack()?.id;
    if (!trackId) return;

    setIsLoadingList(true);
    try {
      const data = await apiClient.listTrackImpulses(trackId);
      setImpulses(data);
    } catch (error) {
      console.error("Failed to load impulses:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const applyImpulse = async (impulse: { url: string; id?: string; filename?: string }) => {
    const reverbBlock = block();
    if (!reverbBlock || typeof reverbBlock.loadImpulseResponse !== "function") return;

    setIsApplyingImpulse(true);
    try {
      await reverbBlock.loadImpulseResponse(impulse.url);
      props.onUpdate("impulseUrl", impulse.url);
      props.onUpdate("impulseId", impulse.id || "");
      props.onUpdate("impulseName", impulse.filename || "");
      setManualUrl(impulse.url);
    } catch (error) {
      console.error("Failed to apply IR:", error);
    } finally {
      setIsApplyingImpulse(false);
    }
  };

  const handleUpload = async (file: File) => {
    const trackId = studio.currentTrack()?.id;
    if (!trackId) throw new Error("No track selected");

    try {
      setUploadProgress(0);
      const impulse = await apiClient.uploadImpulse(trackId, file, (progress) => {
        setUploadProgress(progress);
      });

      setImpulses([impulse, ...impulses()]);
      await applyImpulse({ url: impulse.url, id: impulse.id, filename: impulse.filename });
    } catch (error) {
      console.error("Failed to load impulse:", error);
      throw error;
    } finally {
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  const handleSelectImpulse = async (impulse: ImpulseResponse) => {
    await applyImpulse({ url: impulse.url, id: impulse.id, filename: impulse.filename });
  };

  const handleManualLoad = async () => {
    const url = manualUrl().trim();
    if (!url) return;

    await applyImpulse({ url });
  };

  const resetToGenerated = () => {
    props.onUpdate("impulseUrl", "");
    props.onUpdate("impulseId", "");
    props.onUpdate("impulseName", "");
    setManualUrl("");
  };

  const toggleNormalize = () => {
    props.onUpdate("normalize", !normalize());
  };

  onMount(() => {
    loadImpulses();

    const url = currentImpulseUrl();
    if (url) {
      const reverbBlock = block();
      if (reverbBlock && typeof reverbBlock.loadImpulseResponse === "function") {
        reverbBlock.loadImpulseResponse(url).catch((error: unknown) => {
          console.error("Failed to load saved IR:", error);
        });
      }
    }
  });

  return (
    <Vertical gap="xl" fullWidth>
      <Horizontal gap="lg" align="center" justify="center">
        <Knob
          label="Size"
          value={size()}
          min={0.1}
          max={5.0}
          step={0.1}
          onChange={(v) => props.onUpdate("size", v)}
          color={token("colors.accent.purple")}
        />
        <Knob
          label="Decay"
          value={decay()}
          min={0.1}
          max={10}
          step={0.1}
          unit="s"
          onChange={(v) => props.onUpdate("decay", v)}
          color={token("colors.accent.pink")}
        />
        <Knob
          label="Mix"
          value={mix()}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => props.onUpdate("mix", v / 100)}
          color={token("colors.accent.cyan")}
        />
      </Horizontal>

      <Vertical gap="md" fullWidth>
        <div class={sectionTitleStyle}>Impulse Responses</div>

        <FileUpload
          accept="audio/*"
          maxSize={20 * 1024 * 1024}
          onUpload={handleUpload}
        />

        <Show when={uploadProgress() > 0}>
          <div class={uploadHintStyle}>
            Loading... {uploadProgress().toFixed(0)}%
          </div>
        </Show>

        <div class={urlRowStyle}>
          <input
            class={urlInputStyle}
            placeholder="https://…/impulse.wav"
            value={manualUrl()}
            onInput={(event) => setManualUrl(event.currentTarget.value)}
            disabled={isApplyingImpulse()}
          />
          <Button
            size="sm"
            variant="primary"
            disabled={!manualUrl().trim() || isApplyingImpulse()}
            onClick={handleManualLoad}
          >
            Apply
          </Button>
        </div>

        <Horizontal gap="sm">
          <Button size="sm" variant="secondary" onClick={toggleNormalize}>
            {normalize() ? "Normalize: On" : "Normalize: Off"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isApplyingImpulse()}
            onClick={resetToGenerated}
          >
            Reset to generator
          </Button>
        </Horizontal>
      </Vertical>

      <Show when={isLoadingList()}>
        <div class={loadingStateStyle}>Loading library…</div>
      </Show>

      <Show when={!isLoadingList() && impulses().length > 0}>
        <Vertical gap="md" fullWidth>
          <div class={sectionTitleStyle}>Saved IR</div>
          <div class={impulsesListStyle}>
            <For each={impulses()}>
              {(impulse) => (
                <button
                  type="button"
                  class={impulseItemStyle}
                  classList={{ [impulseActiveStyle]: currentImpulseId() === impulse.id }}
                  onClick={() => handleSelectImpulse(impulse)}
                  disabled={isApplyingImpulse()}
                >
                  <div class={impulseIconStyle}>🌊</div>
                  <Vertical gap="xs" class={impulseInfoStyle}>
                    <div class={impulseNameStyle}>{impulse.filename}</div>
                    <div class={impulseMetaStyle}>
                      {(impulse.size / 1024).toFixed(0)} KB
                    </div>
                  </Vertical>
                </button>
              )}
            </For>
          </div>
        </Vertical>
      </Show>

      <Show when={!isLoadingList() && impulses().length === 0}>
        <div class={emptyStateStyle}>
          There are no impulse responses yet. Upload a file or paste the URL.
        </div>
      </Show>

      <Show when={currentImpulseName()}>
        <div class={currentImpulseStyle}>
          Active IR: <span>{currentImpulseName() || "Custom"}</span>
        </div>
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

const urlRowStyle = css({
  display: "flex",
  gap: token("spacing.sm"),
});

const urlInputStyle = css({
  flex: 1,
  padding: `${token("spacing.xs")} ${token("spacing.sm")}`,
  borderRadius: token("radii.sm"),
  border: `1px solid ${token("colors.border.primary")}`,
  background: token("colors.surface.secondary"),
  color: token("colors.text.primary"),
  fontSize: token("fontSizes.sm"),
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

const uploadHintStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});

const impulsesListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: token("spacing.xs"),
  maxHeight: "220px",
  overflowY: "auto",
});

const impulseItemStyle = css({
  display: "flex",
  gap: token("spacing.sm"),
  alignItems: "center",
  width: "100%",
  borderRadius: token("radii.md"),
  border: `1px solid ${token("colors.border.primary")}`,
  background: token("colors.surface.secondary"),
  padding: token("spacing.sm"),
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    borderColor: token("colors.border.accent"),
    background: token("colors.surface.hover"),
  },
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

const impulseActiveStyle = css({
  borderColor: token("colors.border.accent"),
  background: "rgba(139, 92, 246, 0.1)",
});

const impulseIconStyle = css({
  fontSize: token("fontSizes.xl"),
});

const impulseInfoStyle = css({
  flex: 1,
  minWidth: 0,
});

const impulseNameStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const impulseMetaStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});

const currentImpulseStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.secondary"),
  "& span": {
    color: token("colors.text.primary"),
  },
});

const loadingStateStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});

const emptyStateStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.secondary"),
  textAlign: "center",
  padding: token("spacing.md"),
});
