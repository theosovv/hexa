import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export const useAudioEngine = () => {
  const [initialized, setInitialized] = useState(false);
  const [playing, setPlaying] = useState(false);

  const init = async () => {
    try {
      await invoke("init_audio");
      setInitialized(true);
      return true;
    } catch (error) {
      console.error("Failed to init audio:", error);
      return false;
    }
  };

  const play = async () => {
    try {
      await invoke("play_audio");
      setPlaying(true);
    } catch (error) {
      console.error("Failed to play:", error);
    }
  };

  const stop = async () => {
    try {
      await invoke("stop_audio");
      setPlaying(false);
    } catch (error) {
      console.error("Failed to stop:", error);
    }
  };

  return { initialized, playing, init, play, stop };
};
