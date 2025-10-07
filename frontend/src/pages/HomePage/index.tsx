import { useNavigate } from "@solidjs/router";
import { Show, For, createSignal, onMount } from "solid-js";

import { TrackCard } from "./components/TrackCard";
import {
  emptyIconStyle,
  emptyStyle,
  emptySubtextStyle,
  emptyTextStyle,
  nameStyle,
  pageStyle,
  sectionTitleStyle,
  storageStyle,
  titleStyle,
  tracksGridStyle,
} from "./styles";

import { apiClient } from "@/api/client";
import type { Track } from "@/api/types/track";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Button, Card, Horizontal, Spinner, Vertical } from "@/uikit";

export function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [tracks, setTracks] = createSignal<Track[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  const loadTracks = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.listTracks();
      setTracks(data);
    } catch (error) {
      console.error("Failed to load tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    loadTracks();
  });

  const handleLogout = async () => {
    await auth.logout();
  };

  const createNewTrack = async () => {
    try {
      const track = await apiClient.createTrack({
        title: `Untitled Track ${tracks().length + 1}`,
        description: "",
        bpm: 120,
        graph_data: { nodes: [], connections: [] },
      });
      navigate(`/studio/${track.id}`);
    } catch (error) {
      console.error("Failed to create track:", error);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    try {
      await apiClient.deleteTrack(id);
      await loadTracks();
    } catch (error) {
      console.error("Failed to delete track:", error);
    }
  };

  return (
    <Vertical fullWidth padding="2xl" gap="2xl" class={pageStyle}>
      <Horizontal justify="between" align="center" fullWidth>
        <h1 class={titleStyle}>Patchwork</h1>

        <Card padding="md" variant="glass">
          <Horizontal gap="md" align="center">
            <Avatar src={auth.user()?.avatar_url} alt={auth.user()?.email} size="md" />
            <Vertical gap="xs">
              <div class={nameStyle}>{auth.user()?.display_name || auth.user()?.email}</div>
              <div class={storageStyle}>
                {((auth.user()!.storage_used / 1024 / 1024) || 0).toFixed(1)} MB
                / {(auth.user()!.storage_limit / 1024 / 1024).toFixed(0)} MB
              </div>
            </Vertical>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Logout
            </Button>
          </Horizontal>
        </Card>
      </Horizontal>

      <Vertical gap="lg" fullWidth>
        <Horizontal justify="between" align="center">
          <h2 class={sectionTitleStyle}>My Tracks</h2>
          <Button onClick={createNewTrack} variant="primary">
            + New Track
          </Button>
        </Horizontal>

        <Show
          when={!isLoading()}
          fallback={
            <Horizontal justify="center" padding="3xl">
              <Spinner size="lg" />
            </Horizontal>
          }
        >
          <Show
            when={tracks().length > 0}
            fallback={
              <Vertical align="center" gap="lg" padding="3xl" class={emptyStyle}>
                <div class={emptyIconStyle}>🎵</div>
                <p class={emptyTextStyle}>No tracks yet</p>
                <p class={emptySubtextStyle}>Create your first modular synthesizer patch</p>
                <Button onClick={createNewTrack} variant="primary" size="lg">
                  Create Your First Track
                </Button>
              </Vertical>
            }
          >
            <div class={tracksGridStyle}>
              <For each={tracks()}>
                {(track) => <TrackCard track={track} onDelete={handleDeleteTrack} />}
              </For>
            </div>
          </Show>
        </Show>
      </Vertical>
    </Vertical>
  );
}
