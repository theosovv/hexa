import { Canvas } from "../components/Canvas";
import { NodeSettingsDrawer } from "../components/NodeSettingsDrawer";
import { Toolbar } from "../components/Toolbar";
import { StudioProvider } from "../contexts/StudioContext";

export function StudioPage() {
  return (
    <StudioProvider>
      <Toolbar />
      <Canvas />
      <NodeSettingsDrawer />
    </StudioProvider>
  );
}
