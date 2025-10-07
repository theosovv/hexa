import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import { useStudio } from "../../../../contexts/StudioContext";
import { Button, Horizontal } from "../../../../uikit";

import {
  dividerStyle,
  logoContainerStyle,
  logoTextStyle,
  savingBadgeStyle,
  toolbarStyle,
  trackTitleStyle,
} from "./styles";

export function Toolbar() {
  const studio = useStudio();
  const navigate = useNavigate();

  const handleSave = async () => {
    await studio.saveTrack();
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div class={toolbarStyle}>
      <Horizontal gap="lg" align="center">
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

        <Show when={studio.currentTrack()}>
          <div class={dividerStyle} />
          <span class={trackTitleStyle}>{studio.currentTrack()!.title}</span>
        </Show>

        <Show when={studio.isSaving()}>
          <div class={savingBadgeStyle}>
            <div class="spinner spinner-sm" />
            Saving
          </div>
        </Show>
      </Horizontal>

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
      </Horizontal>
    </div>
  );
}
