import { createContext, createSignal, onCleanup, onMount, useContext, type ParentComponent } from "solid-js";

import { AudioContextManager } from "../audio/AudioContextManager";
import { AudioGraphManager } from "../audio/AudioGraphManager";
import type { AudioBlockType } from "../audio/types";
import { createCanvasStore } from "../canvas/store";
import type { ConnectionData, NodeData } from "../canvas/types";
import { KeyboardShortcutManager } from "../utils/keyboardShortcuts";

interface StudioContextType {
  canvasStore: ReturnType<typeof createCanvasStore>;
  audioGraph: AudioGraphManager;
  isPlaying: () => boolean;
  selectedNodeId: () => string | null;
  selectNode: (id: string | null) => void;
  togglePlayback: () => void;
  addNode: (type: AudioBlockType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (id: string) => void;
}

const StudioContext = createContext<StudioContextType>();

export const StudioProvider: ParentComponent = (props) => {
  const canvasStore = createCanvasStore();
  const audioGraph = new AudioGraphManager();
  const audioManager = AudioContextManager.getInstance();
  const shortcuts = new KeyboardShortcutManager();

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);

  let nodeCounter = 0;

  const selectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };

  const togglePlayback = () => {
    if (isPlaying()) {
      audioManager.suspend();
      setIsPlaying(false);
    } else {
      audioManager.resume();

      Array.from(audioGraph["blocks"].values()).forEach((block) => {
        if (block.type === "oscillator" && "start" in block) {
          (block as any).start();
        }
      });

      setIsPlaying(true);
    }
  };

  // Add node
  const addNode = (type: AudioBlockType, position: { x: number; y: number }) => {
    const id = `node-${++nodeCounter}`;

    const defaultParams: Record<string, any> = {
      oscillator: { freq: "440Hz", type: "sine", gain: 0.5, detune: 0 },
      filter: { cutoff: "1kHz", type: "lowpass", q: 1, gain: 0 },
      delay: { time: "0.25s", feedback: 0.3, mix: 0.5 },
      reverb: { size: "2.0", decay: 3.0, mix: 0.3 },
      master: { volume: 0.8 },
    };

    const nodeData: NodeData = {
      id,
      type,
      position,
      params: defaultParams[type] || {},
    };

    canvasStore.addNode(nodeData);
    audioGraph.createBlock(id, type);

    // If playing, start the oscillator immediately
    if (isPlaying() && type === "oscillator") {
      const block = audioGraph.getBlock(id);
      if (block && "start" in block) {
        (block as any).start();
      }
    }
  };

  const removeNode = (id: string) => {
    if (selectedNodeId() === id) {
      setSelectedNodeId(null);
    }

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

  onMount(() => {
    shortcuts.register({
      key: "Delete",
      action: () => {
        const id = selectedNodeId();
        if (id) {
          removeNode(id);
        }
      },
    });

    shortcuts.register({
      key: "Backspace",
      action: () => {
        const id = selectedNodeId();
        if (id) {
          removeNode(id);
        }
      },
    });

    shortcuts.register({
      key: "Escape",
      action: () => {
        selectNode(null);
      },
    });

    shortcuts.register({
      key: " ",
      action: () => {
        togglePlayback();
      },
    });

    document.addEventListener("keydown", shortcuts.handleKeyDown);
  });

  onCleanup(() => {
    audioGraph.clear();
    shortcuts.clear();
    document.removeEventListener("keydown", shortcuts.handleKeyDown);
  });

  const value: StudioContextType = {
    canvasStore,
    audioGraph,
    isPlaying,
    selectedNodeId,
    selectNode,
    togglePlayback,
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
