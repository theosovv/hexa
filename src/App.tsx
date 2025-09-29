import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function App() {
  const [status, setStatus] = useState("");

  const initAudio = async () => {
    try {
      const result = await invoke("init_audio");
      setStatus(result as string);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="app">
      <h1>Hexa DAW</h1>
      <button onClick={initAudio}>Initialize Audio</button>
      <p>{status}</p>
    </div>
  );
}
