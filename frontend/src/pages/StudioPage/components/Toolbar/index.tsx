import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";


import {
  dividerStyle,
  logoContainerStyle,
  logoTextStyle,
  savingBadgeStyle,
  titleInputStyle,
  toolbarStyle,
  trackTitleStyle,
} from "./styles";

import { useStudio } from "@/contexts/StudioContext";
import { Button, Horizontal, Input } from "@/uikit";

export function Toolbar() {
  const studio = useStudio();
  const navigate = useNavigate();

  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [tempTitle, setTempTitle] = createSignal("");

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
      <Horizontal gap="sm" align="center">
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
      </Horizontal>
    </div>
  );
}
