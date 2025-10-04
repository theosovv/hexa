import { Canvas } from "../components/Canvas";
import { Toolbar } from "../components/Toolbar";
import { StudioProvider } from "../contexts/StudioContext";

export function StudioPage() {
  return (
    <StudioProvider>
      <Toolbar />
      <Canvas />
    </StudioProvider>
  );
}
