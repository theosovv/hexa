import { createContext, createEffect, createSignal, onCleanup, onMount, useContext, type ParentComponent } from "solid-js";

import type { Track } from "../api/types/track";
import { AudioContextManager } from "../audio/AudioContextManager";
import { AudioGraphManager } from "../audio/AudioGraphManager";
import type { AudioBlockType } from "../audio/types";
import { createCanvasStore } from "../canvas/store";
import type { ConnectionData, NodeData } from "../canvas/types";
import { KeyboardShortcutManager } from "../utils/keyboardShortcuts";
import { useNavigate, useParams } from "@solidjs/router";
import { deserializeGraph, serializeGraph } from "../utils/graphSerializer";
import { apiClient } from "../api/client";
import { debounce } from "../utils/debounce";

interface StudioContextType {
  canvasStore: ReturnType<typeof createCanvasStore>;
  audioGraph: AudioGraphManager;
  currentTrack: () => Track | null;
  isPlaying: () => boolean;
  isSaving: () => boolean;
  selectedNodeId: () => string | null;
  selectNode: (id: string | null) => void;
  togglePlayback: () => void;
  saveTrack: () => Promise<void>;
  loadTrack: (id: string) => Promise<void>;
  createNewTrack: (title: string) => Promise<Track>;
  addNode: (type: AudioBlockType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (id: string) => void;
}

const StudioContext = createContext<StudioContextType>();

export const StudioProvider: ParentComponent = (props) => {
  const params = useParams<{ trackId?: string }>();
  const navigate = useNavigate();

  const canvasStore = createCanvasStore();
  const audioGraph = new AudioGraphManager();
  const audioManager = AudioContextManager.getInstance();
  const shortcuts = new KeyboardShortcutManager();

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);
  const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);

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

      Array.from(audioGraph.blocks.values()).forEach((block) => {
        if (block.type === "oscillator" && "start" in block) {
          (block as any).start();
        }
      });

      setIsPlaying(true);
    }
  };

  // Create new track
  const createNewTrack = async (title: string): Promise<Track> => {
    const graphData = serializeGraph(
      canvasStore.nodes(),
      canvasStore.connections(),
    );

    const track = await apiClient.createTrack({
      title,
      description: "",
      bpm: 120,
      graph_data: graphData,
    });

    setCurrentTrack(track);

    navigate(`/studio/${track.id}`);
    return track;
  };

  // Save current track
  const saveTrack = async () => {
    const track = currentTrack();
    if (!track) {
      console.warn("No track to save, creating new...");
      await createNewTrack("Untitled Track");
      return;
    }

    setIsSaving(true);
    try {
      const graphData = serializeGraph(
        canvasStore.nodes(),
        canvasStore.connections(),
      );

      const updated = await apiClient.updateTrackGraph(track.id, graphData);
      setCurrentTrack(updated);
      console.log("✓ Track saved");
    } catch (error) {
      console.error("Failed to save track:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save
  const debouncedSave = () => debounce(saveTrack, 2000);

  // Load track from backend
  const loadTrack = async (id: string) => {
    try {
      const track = await apiClient.getTrack(id);
      setCurrentTrack(track);

      // Clear existing graph
      audioGraph.clear();
      canvasStore.nodes().forEach((_, nodeId) => {
        canvasStore.removeNode(nodeId);
      });

      // Deserialize and load graph
      const { nodes, connections } = deserializeGraph(track.graph_data);

      // Recreate nodes
      nodes.forEach((node) => {
        canvasStore.addNode(node);
        audioGraph.createBlock(node.id, node.type as AudioBlockType, node.params);

        // Update node counter
        const num = parseInt(node.id.split("-")[1]);
        if (num > nodeCounter) {
          nodeCounter = num;
        }
      });

      // Recreate connections
      connections.forEach((conn) => {
        canvasStore.addConnection(conn);
        audioGraph.connect(conn.from, conn.to);
      });

      console.log("✓ Track loaded:", track.title);
    } catch (error) {
      console.error("Failed to load track:", error);
    }
  };

  // Auto-save on graph changes
  createEffect(() => {
    const nodes = canvasStore.nodes();
    const connections = canvasStore.connections();

    if (currentTrack() && (nodes.size > 0 || connections.size > 0)) {
      debouncedSave();
    }
  });

  // Load track on mount if trackId in params
  onMount(() => {
    if (params.trackId) {
      loadTrack(params.trackId);
    }

    // Setup keyboard shortcuts
    shortcuts.register({
      key: "Delete",
      action: () => {
        const id = selectedNodeId();
        if (id) removeNode(id);
      },
    });

    shortcuts.register({
      key: "Backspace",
      action: () => {
        const id = selectedNodeId();
        if (id) removeNode(id);
      },
    });

    shortcuts.register({
      key: "Escape",
      action: () => selectNode(null),
    });

    shortcuts.register({
      key: " ",
      action: () => togglePlayback(),
    });

    shortcuts.register({
      key: "s",
      ctrl: true,
      action: () => saveTrack(),
    });

    document.addEventListener("keydown", shortcuts.handleKeyDown);
  });

  const addNode = (type: AudioBlockType, position: { x: number; y: number }) => {
    const id = `node-${++nodeCounter}`;

    const defaultParams: Record<string, any> = {
      oscillator: { freq: "440Hz", type: "sine", gain: 0.5, detune: 0 },
      filter: { cutoff: "1kHz", type: "lowpass", q: 1, gain: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0.5 },
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

  onCleanup(() => {
    audioGraph.clear();
    shortcuts.clear();
    document.removeEventListener("keydown", shortcuts.handleKeyDown);
  });

  const value: StudioContextType = {
    canvasStore,
    audioGraph,
    currentTrack,
    isPlaying,
    isSaving,
    selectedNodeId,
    selectNode,
    togglePlayback,
    saveTrack,
    loadTrack,
    createNewTrack,
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
