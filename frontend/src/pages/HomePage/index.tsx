import { useNavigate } from "@solidjs/router";
import { Show, For, createSignal, onMount } from "solid-js";

import { TrackCard } from "./components/TrackCard";
import { emptyStyle, emptyTextStyle, headerStyle, loadingStyle, nameStyle, sectionTitleStyle, storageStyle, titleStyle, tracksGridStyle, tracksHeaderStyle, userCardStyle, userInfoStyle } from "./styles";

import { apiClient } from "@/api/client";
import type { Track } from "@/api/types/track";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Button, Card, Container, Spinner } from "@/uikit";


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
    <Container maxWidth="lg">
      <div class={headerStyle}>
        <h1 class={titleStyle}>🎵 Hexa</h1>

        <Card padding="sm">
          <div class={userCardStyle}>
            <Avatar src={auth.user()?.avatar_url} alt={auth.user()?.email} size="md" />
            <div class={userInfoStyle}>
              <div class={nameStyle}>{auth.user()?.display_name || auth.user()?.email}</div>
              <div class={storageStyle}>
                {((auth.user()!.storage_used / 1024 / 1024) || 0).toFixed(1)} MB
                / {(auth.user()!.storage_limit / 1024 / 1024).toFixed(0)} MB
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </Card>
      </div>

      <div class={tracksHeaderStyle}>
        <h2 class={sectionTitleStyle}>My Tracks</h2>
        <Button onClick={createNewTrack} variant="primary">
          + New Track
        </Button>
      </div>

      <Show
        when={!isLoading()}
        fallback={
          <div class={loadingStyle}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Show
          when={tracks().length > 0}
          fallback={
            <div class={emptyStyle}>
              <p class={emptyTextStyle}>No tracks yet</p>
              <Button onClick={createNewTrack} variant="primary">
                Create Your First Track
              </Button>
            </div>
          }
        >
          <div class={tracksGridStyle}>
            <For each={tracks()}>
              {(track) => <TrackCard track={track} onDelete={handleDeleteTrack} />}
            </For>
          </div>
        </Show>
      </Show>
    </Container>
  );
}
