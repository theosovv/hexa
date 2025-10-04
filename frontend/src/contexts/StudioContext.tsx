import { createContext, onCleanup, useContext, type ParentComponent } from "solid-js";

import { AudioGraphManager } from "../audio/AudioGraphManager";
import type { AudioBlockType } from "../audio/types";
import { createCanvasStore } from "../canvas/store";
import type { ConnectionData, NodeData } from "../canvas/types";

interface StudioContextType {
  canvasStore: ReturnType<typeof createCanvasStore>;
  audioGraph: AudioGraphManager;
  addNode: (type: AudioBlockType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (id: string) => void;
}

const StudioContext = createContext<StudioContextType>();

export const StudioProvider: ParentComponent = (props) => {
  const canvasStore = createCanvasStore();
  const audioGraph = new AudioGraphManager();

  let nodeCounter = 0;

  const addNode = (type: AudioBlockType, position: { x: number; y: number }) => {
    const id = `node-${++nodeCounter}`;

    const defaultParams: Record<string, unknown> = {
      oscillator: { freq: "440Hz", type: "sine" },
      filter: { cutoff: "1kHz" },
      master: { volume: "0.8" },
    };

    const nodeData: NodeData = {
      id,
      type,
      position,
      params: (defaultParams[type] || {}) as Record<string, unknown>,
    };

    canvasStore.addNode(nodeData);

    audioGraph.createBlock(id, type);
  };

  const removeNode = (id: string) => {
    canvasStore.removeNode(id);
    audioGraph.removeBlock(id);
  };

  const addConnection = (fromId: string, toId: string) => {
    const connectionId = audioGraph.connect(fromId, toId);

    if (connectionId) {
      const conn: ConnectionData = {
        id: connectionId,
        from: fromId,
        to: toId,
        fromPort: "output",
        toPort: "input",
      };
      canvasStore.addConnection(conn);
    }
  };

  const removeConnection = (id: string) => {
    canvasStore.removeConnection(id);
    audioGraph.disconnect(id);
  };

  onCleanup(() => {
    audioGraph.clear();
  });

  const value: StudioContextType = {
    canvasStore,
    audioGraph,
    addNode,
    removeNode,
    addConnection,
    removeConnection,
  };

  return <StudioContext.Provider value={value}>{props.children}</StudioContext.Provider>;
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioProvider");
  }
  return context;
};
