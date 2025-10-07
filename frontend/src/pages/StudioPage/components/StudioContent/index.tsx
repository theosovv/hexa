import { NodeSettingsDrawer } from "../NodeSettingsDrawer";
import { Sidebar } from "../Sidebar";
import { Toolbar } from "../Toolbar";

import { pageStyle } from "./styles";

import type { AudioBlockType } from "@/audio/types";
import { Canvas } from "@/canvas";
import { useStudio } from "@/contexts/StudioContext";

export function StudioContent() {
  const studio = useStudio();

  const handleAddBlock = (type: AudioBlockType) => {
    const x = 300 + Math.random() * 200;
    const y = 200 + Math.random() * 200;
    studio.addNode(type, { x, y });
  };

  return (
    <div class={pageStyle}>
      <Toolbar />
      <Sidebar onAddBlock={handleAddBlock} />
      <Canvas />
      <NodeSettingsDrawer />
    </div>
  );
}
