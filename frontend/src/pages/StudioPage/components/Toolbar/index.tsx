import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";


import {
  bitrateRowStyle,
  dividerStyle,
  exportActionsStyle,
  exportButtonContainer,
  exportMenuStyle,
  formatButtonStyle,
  logoContainerStyle,
  logoTextStyle,
  savingBadgeStyle,
  titleInputStyle,
  toolbarStyle,
  trackTitleStyle,
} from "./styles";

import { useStudio } from "@/contexts/StudioContext";
import { Button, Card, Horizontal, Input, Select, Vertical } from "@/uikit";
import { audioBufferToWavBuffer } from "@/utils/audioEncoding";
import { apiClient } from "@/api/client";

export function Toolbar() {
  const studio = useStudio();
  const navigate = useNavigate();

  const isRecording = () => studio.recordingStatus() === "recording";

  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [tempTitle, setTempTitle] = createSignal("");
  const [isExportMenuOpen, setIsExportMenuOpen] = createSignal(false);
  const [isExporting, setIsExporting] = createSignal(false);
  const [bitrate, setBitrate] = createSignal("192");

  const toggleExportMenu = () => setIsExportMenuOpen((prev) => !prev);

  const handleSave = async () => {
    await studio.saveTrack();
  };

  const goHome = () => {
    navigate("/");
  };

  const startEditTitle = () => {
    setTempTitle(studio.currentTrack()?.title || "");
    setIsEditingTitle(true);
  };

  const saveTitle = async () => {
    if (tempTitle().trim() && studio.currentTrack()) {
      await studio.updateTrackMeta({ title: tempTitle().trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  const handleRecordClick = () => {
    if (isRecording()) {
      studio.stopRecording();
    } else {
      studio.startRecording();
    }
  };

  const closeExportMenu = () => setIsExportMenuOpen(false);

  const handleExport = async (format: "wav" | "mp3") => {
    const recorded = studio.recordedBlob();
    if (!recorded) return;

    try {
      setIsExporting(true);

      if (format === "wav") {
        const arrayBuffer = await recorded.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        const wavBuffer = audioBufferToWavBuffer(audioBuffer);
        downloadBlob(new Blob([wavBuffer], { type: "audio/wav" }), `${studio.currentTrack()?.title || "track"}.wav`);
      } else {
        const mp3Blob = await apiClient.exportMp3(recorded, {
          bitrate: Number(bitrate()),
          filename: `${studio.currentTrack()?.title || "track"}.mp3`,
        });
        downloadBlob(mp3Blob, `${studio.currentTrack()?.title || "track"}.mp3`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      // TODO: показать toast/alert
    } finally {
      setIsExporting(false);
      closeExportMenu();
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div class={toolbarStyle}>
      <Horizontal gap="lg" align="center">
        {/* Logo */}
        <Horizontal gap="sm" align="center" class={logoContainerStyle} onClick={goHome}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M 6 10 Q 12 6, 18 10" stroke="#8b5cf6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M 14 22 Q 20 26, 26 22" stroke="#10b981" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <rect x="12" y="12" width="8" height="8" rx="2" fill="#667eea" stroke="#fff" stroke-width="1.5"/>
            <circle cx="6" cy="10" r="3" fill="#8b5cf6"/>
            <circle cx="18" cy="10" r="3" fill="#667eea"/>
            <circle cx="14" cy="22" r="3" fill="#667eea"/>
            <circle cx="26" cy="22" r="3" fill="#10b981"/>
          </svg>
          <h3 class={logoTextStyle}>Patchwork</h3>
        </Horizontal>

        {/* Track info */}
        <Show when={studio.currentTrack()}>
          <div class={dividerStyle} />

          {/* Editable title */}
          <Show
            when={isEditingTitle()}
            fallback={
              <span class={trackTitleStyle} onDblClick={startEditTitle} title="Double-click to edit">
                {studio.currentTrack()!.title}
              </span>
            }
          >
            <Input
              type="text"
              class={titleInputStyle}
              value={tempTitle()}
              onChange={(e) => setTempTitle(e.currentTarget.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              autofocus
            />
          </Show>
        </Show>

        <Show when={studio.isSaving()}>
          <div class={savingBadgeStyle}>
            <div class="spinner spinner-sm" />
            Saving
          </div>
        </Show>
      </Horizontal>

      {/* Transport controls */}
      <Horizontal gap="md" align="center">
        <Button
          onClick={studio.togglePlayback}
          variant={studio.isPlaying() ? "danger" : "primary"}
          size="sm"
        >
          {studio.isPlaying() ? "⏸ Stop" : "▶ Play"}
        </Button>

        <Button onClick={handleSave} variant="secondary" size="sm">
          💾 Save
        </Button>
        <Button onClick={handleRecordClick} variant={"secondary"} size="sm">
          {isRecording() ? "⏸ Stop" : "🔴 Record"}
        </Button>

        <Show when={studio.recordingStatus() === "recorded"}>
          <div class={exportButtonContainer}>
            <Button
              variant="primary"
              onClick={toggleExportMenu}
              disabled={isExporting()}
            >
              {isExporting() ? "Exporting…" : "Download"}
            </Button>

            <Show when={isExportMenuOpen()}>
              <Card class={exportMenuStyle}>
                <Vertical gap="md">
                  <div class={exportActionsStyle}>
                    <Button
                      variant="secondary"
                      class={formatButtonStyle}
                      disabled={isExporting()}
                      onClick={() => handleExport("wav")}
                    >
                      Download WAV
                    </Button>
                    <Button
                      variant="secondary"
                      class={formatButtonStyle}
                      disabled={isExporting()}
                      onClick={() => handleExport("mp3")}
                    >
                      Download MP3
                    </Button>
                  </div>

                  <Horizontal class={bitrateRowStyle} justify="between">
                    <span>Bitrate</span>
                    <Select
                      value={bitrate()}
                      size="sm"
                      onSelectChange={(value) => setBitrate(value)}
                      options={[
                        { value: "128", label: "128 kbps" },
                        { value: "192", label: "192 kbps" },
                        { value: "320", label: "320 kbps" },
                      ]}
                      disabled={isExporting()}
                    />
                  </Horizontal>
                </Vertical>
              </Card>
            </Show>
          </div>
        </Show>
      </Horizontal>
    </div>
  );
}
