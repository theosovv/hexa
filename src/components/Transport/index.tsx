import { useAudioEngine } from "../../hooks/useAudioEngine";
import { BPMControl, Button, Container } from "./styled";

export function Transport() {
  const { initialized, playing, init, play, stop } = useAudioEngine();

  return (
    <Container>
      {!initialized ? (
        <Button onClick={init} $variant="init">
          Initialize Audio Engine
        </Button>
      ) : (
        <>
          <Button onClick={playing ? stop : play} $variant={playing ? "stop" : "play"}>
            {playing ? "⏸ Stop" : "▶ Play"}
          </Button>
          <BPMControl>
            <label>BPM:</label>
            <input type="number" defaultValue={120} min={60} max={200} />
          </BPMControl>
        </>
      )}
    </Container>
  );
}
