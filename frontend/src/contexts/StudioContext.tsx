import { useNavigate, useParams } from "@solidjs/router";
import { createContext, createEffect, createSignal, onCleanup, onMount, useContext, type Accessor, type ParentComponent } from "solid-js";

import { apiClient } from "../api/client";
import type { Track } from "../api/types/track";
import { AudioContextManager } from "../audio/AudioContextManager";
import { AudioGraphManager } from "../audio/AudioGraphManager";
import type { AudioBlockType } from "../audio/types";
import { createCanvasStore } from "../canvas/store";
import type { ConnectionData, NodeData } from "../canvas/types";
import { debounce } from "../utils/debounce";
import { deserializeGraph, serializeGraph } from "../utils/graphSerializer";
import { KeyboardShortcutManager } from "../utils/keyboardShortcuts";
import type { SceneState } from "@/api/types/scene";

interface SceneSnapshot {
  id: string;
  name: string;
  nodeParams: Record<string, Record<string, unknown>>;
  mutedNodeIds: string[];
  position: number;
}

interface StudioContextType {
  canvasStore: ReturnType<typeof createCanvasStore>;
  audioGraph: AudioGraphManager;
  recordingStatus: Accessor<RecordingStatus>;
  recordedBlob: Accessor<Blob | null>
  currentTrack: () => Track | null;
  isPlaying: () => boolean;
  isSaving: () => boolean;
  scenes: Accessor<SceneSnapshot[]>;
  activeSceneId: Accessor<string | null>;
  createScene: (name?: string) => void;
  updateScene: (id: string, name?: string) => void;
  removeScene: (id: string) => void;
  activateScene: (id: string) => void;
  mode: () => StudioMode;
  setMode: (mode: StudioMode) => void;
  setNodeMuted: (id: string, muted: boolean) => void;
  toggleNodeMute: (id: string) => void;
  isNodeMuted: (id: string) => boolean;
  selectedNodeId: () => string | null;
  selectNode: (id: string | null) => void;
  togglePlayback: () => void;
  saveTrack: () => Promise<void>;
  loadTrack: (id: string) => Promise<void>;
  createNewTrack: (title: string) => Promise<Track>;
  addNode: (type: AudioBlockType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  addConnection: (fromId: string, toId: string, toPortIndex?: number) => void;
  removeConnection: (id: string) => void;
  updateTrackMeta: (meta: { title?: string; bpm?: number }) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

type RecordingStatus = "idle" | "recording" | "recorded" | "error";
type StudioMode = "edit" | "live";

const MODE_STORAGE_KEY = "hexa_studio_mode";

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
  const [recordingStatus, setRecordingStatus] = createSignal<RecordingStatus>("idle");
  const [recordedBlob, setRecordedBlob] = createSignal<Blob | null>(null);
  const [recorder, setRecorder] = createSignal<MediaRecorder | null>(null);
  const recordedChunks: BlobPart[] = [];

  const [mutedNodes, setMutedNodes] = createSignal<Set<string>>(new Set());
  const [scenes, setScenes] = createSignal<SceneSnapshot[]>([]);
  const [activeSceneId, setActiveSceneId] = createSignal<string | null>(null);

  const generateId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const cloneParams = (params: Record<string, unknown>): Record<string, unknown> => {
    if (typeof structuredClone === "function") {
      return structuredClone(params);
    }
    return JSON.parse(JSON.stringify(params));
  };

  const captureSceneSnapshot = (name: string, forcedId?: string, forcedPosition?: number): SceneSnapshot => {
    const nodeParams: Record<string, Record<string, unknown>> = {};
    canvasStore.nodes().forEach((node, nodeId) => {
      nodeParams[nodeId] = cloneParams(node.params);
    });

    return {
      id: forcedId ?? generateId(),
      name,
      nodeParams,
      mutedNodeIds: Array.from(mutedNodes()),
      position: forcedPosition ?? scenes().length,
    };
  };

  const buildSceneState = (snapshot: SceneSnapshot): SceneState => ({
    nodeParams: snapshot.nodeParams,
    mutedNodeIds: snapshot.mutedNodeIds,
  });

  const applyScene = (scene: SceneSnapshot) => {
    const nodes = canvasStore.nodes();

    Object.entries(scene.nodeParams).forEach(([nodeId, params]) => {
      const node = nodes.get(nodeId);
      if (!node) return;

      const nextParams = { ...node.params, ...params };
      canvasStore.updateNode(nodeId, { params: nextParams });

      Object.entries(params).forEach(([key, value]) => {
        audioGraph.updateBlockParam(nodeId, key, value as any);
      });
    });

    const muted = new Set(scene.mutedNodeIds);
    nodes.forEach((_, nodeId) => {
      setNodeMuted(nodeId, muted.has(nodeId));
    });
  };

  const createScene = async (name?: string) => {
    const track = currentTrack();
    if (!track) return;

    const sceneName = name ?? `Scene ${scenes().length + 1}`;
    const snapshot = captureSceneSnapshot(sceneName);
    const state = buildSceneState(snapshot);

    const created = await apiClient.createScene(track.id, {
      name: snapshot.name,
      position: snapshot.position,
      state_data: state,
    });

    setScenes((prev) => [
      ...prev,
      {
        id: created.id,
        name: created.name,
        nodeParams: snapshot.nodeParams,
        mutedNodeIds: snapshot.mutedNodeIds,
        position: created.position,
      },
    ]);
    setActiveSceneId(created.id);
  };

  const updateScene = async (id: string, name?: string) => {
    const track = currentTrack();
    if (!track) return;

    const existing = scenes().find((scene) => scene.id === id);
    if (!existing) return;

    const snapshot = captureSceneSnapshot(name ?? existing.name, id, existing.position);
    const state = buildSceneState(snapshot);

    const updated = await apiClient.updateScene(id, {
      name: snapshot.name,
      position: snapshot.position,
      state_data: state,
    });

    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === id
          ? {
            id: updated.id,
            name: updated.name,
            position: updated.position,
            nodeParams: snapshot.nodeParams,
            mutedNodeIds: snapshot.mutedNodeIds,
          }
          : scene,
      ),
    );

    if (activeSceneId() === id) {
      applyScene({
        id: updated.id,
        name: updated.name,
        nodeParams: snapshot.nodeParams,
        mutedNodeIds: snapshot.mutedNodeIds,
        position: updated.position,
      });
    }
  };

  const activateScene = (id: string) => {
    const scene = scenes().find((s) => s.id === id);
    if (!scene) return;

    setActiveSceneId(id);
    applyScene(scene);
  };

  const removeScene = async (id: string) => {
    const track = currentTrack();
    if (!track) return;

    await apiClient.deleteScene(id);

    setScenes((prev) => {
      const filtered = prev.filter((scene) => scene.id !== id);
      if (filtered.length === 0) {
        setActiveSceneId(null);
      } else if (activeSceneId() === id) {
        const nextScene = filtered[0];
        setActiveSceneId(nextScene.id);
        applyScene(nextScene);
      }
      return filtered;
    });
  };

  const isNodeMuted = (id: string) => mutedNodes().has(id);

  const setNodeMuted = (id: string, muted: boolean) => {
    const block = audioGraph.getBlock(id);
    if (block) {
      block.setMuted?.(muted);
    }
    setMutedNodes((prev) => {
      const next = new Set(prev);
      if (muted) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleNodeMute = (id: string) => {
    setNodeMuted(id, !isNodeMuted(id));
  };

  const loadInitialMode = (): StudioMode => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return stored === "live" ? "live" : "edit";
  };

  const [mode, setMode] = createSignal<StudioMode>(loadInitialMode());

  let nodeCounter = 0;

  const switchMode = (next: StudioMode) => {
    if (mode() === next) return;

    setMode(next);
    localStorage.setItem(MODE_STORAGE_KEY, next);

    if (next === "live") {
      if (scenes().length === 0) {
        const snapshot = captureSceneSnapshot("Scene 1");
        setScenes([snapshot]);
        setActiveSceneId(snapshot.id);
      } else if (activeSceneId()) {
        const scene = scenes().find((s) => s.id === activeSceneId());
        if (scene) applyScene(scene);
      }
    }
  };

  const selectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };

  const startRecording = async () => {
    if (recordingStatus() === "recording") return;

    const audioManager = AudioContextManager.getInstance();
    const streamDestination = audioManager.getStreamDestination(); // нужно добавить метод, см. ниже

    try {
      const stream = streamDestination.stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

      recordedChunks.length = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordingStatus("recorded");
        setRecorder(null);
      };

      mediaRecorder.onerror = () => {
        setRecordingStatus("error");
        setRecorder(null);
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setRecordedBlob(null);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setRecordingStatus("error");
    }
  };

  const stopRecording = () => {
    const current = recorder();
    if (current && recordingStatus() === "recording") {
      current.stop();
      setRecorder(null);
    }
  };

  const togglePlayback = () => {
    if (isPlaying()) {
      audioManager.suspend();

      Array.from(audioGraph.blocks.values()).forEach((block) => {
        if (block.type === "sampler" && "stop" in block) {
          (block as any).stop();
        }
        if (block.type === "sequencer" && "stop" in block) {
          (block as any).stop();
        }
      });

      setIsPlaying(false);
    } else {
      audioManager.resume();

      Array.from(audioGraph.blocks.values()).forEach((block) => {
        if (block.type === "oscillator" && "start" in block) {
          (block as any).start();
        }
        if (block.type === "sequencer" && "start" in block) {
          (block as any).start();
        }
      });

      Array.from(audioGraph.blocks.values()).forEach((block) => {
        if (block.type === "sampler" && "play" in block) {
          const samplerBlock = block as any;
          if (samplerBlock.buffer && samplerBlock.params.loop) {
            samplerBlock.play();
          }
        }
      });

      setIsPlaying(true);
    }
  };

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
    setScenes([]);
    setActiveSceneId(null);
    setMutedNodes(new Set<string>());

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

  const loadScenesForTrack = async (trackId: string) => {
    try {
      const rows = await apiClient.listScenes(trackId);
      if (!rows.length) {
        setScenes([]);
        setActiveSceneId(null);
        return;
      }

      const snapshots = rows.map((row) => ({
        id: row.id,
        name: row.name,
        nodeParams: row.state_data.nodeParams ?? {},
        mutedNodeIds: row.state_data.mutedNodeIds ?? [],
        position: row.position,
      }));

      setScenes(snapshots);
      const initialScene = snapshots[0];
      setActiveSceneId(initialScene.id);
      applyScene(initialScene);          // ← накатываем параметры на граф
    } catch (error) {
      console.error("Failed to load scenes:", error);
      setScenes([]);
      setActiveSceneId(null);
    }
  };

  // Load track from backend
  const loadTrack = async (id: string) => {
    try {
      const track = await apiClient.getTrack(id);
      setCurrentTrack(track);

      audioGraph.clear();
      canvasStore.nodes().forEach((_, nodeId) => {
        canvasStore.removeNode(nodeId);
      });
      setMutedNodes(new Set<string>());
      setScenes([]);
      setActiveSceneId(null);

      const { nodes, connections } = deserializeGraph(track.graph_data);

      nodes.forEach((node) => {
        canvasStore.addNode(node);
        audioGraph.createBlock(node.id, node.type as AudioBlockType, node.params);

        const num = parseInt(node.id.split("-")[1], 10);
        if (!Number.isNaN(num) && num > nodeCounter) {
          nodeCounter = num;
        }
      });

      connections.forEach((conn) => {
        canvasStore.addConnection(conn);
        audioGraph.connect(conn.from, conn.to, conn.toPortIndex);
      });

      await loadScenesForTrack(track.id);

      if (scenes().length === 0) {
        await createScene("Scene 1");
      }

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
      sampler: { gain: 0.8, playbackRate: 1.0, loop: false, sampleUrl: "" },
      filter: { cutoff: "1kHz", type: "lowpass", q: 1, gain: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0.5 },
      reverb: { size: "2.0", decay: 3.0, mix: 0.3 },
      mixer: { channels: 4, master: 1 },
      lfo: { frequency: 2, depth: 0.5, offset: 0.5, waveform: "sine", active: true },
      sequencer: {
        bpm: 120,
        stepsPerBar: 16,
        swing: 0,
        playing: false,
        steps: Array.from({ length: 16 }, (_, index) => ({
          active: index % 4 === 0,
          velocity: 1,
          probability: 1,
        })),
      },
      master: { volume: 0.8, clipThreshold: 0.8 },
    };

    const nodeData: NodeData = {
      id,
      type,
      position,
      params: defaultParams[type] || {},
    };

    canvasStore.addNode(nodeData);
    audioGraph.createBlock(id, type, nodeData.params);

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

    setMutedNodes((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    canvasStore.removeNode(id);
    audioGraph.removeBlock(id);
  };

  const addConnection = (fromId: string, toId: string, toPortIndex?: number) => {
    const connectionId = audioGraph.connect(fromId, toId, toPortIndex);

    if (connectionId) {
      const conn: ConnectionData = {
        id: connectionId,
        from: fromId,
        to: toId,
        fromPort: "output",
        toPort: "input",
        toPortIndex,
      };
      canvasStore.addConnection(conn);
    }
  };

  const removeConnection = (id: string) => {
    canvasStore.removeConnection(id);
    audioGraph.disconnect(id);
  };

  const updateTrackMeta = async (meta: { title?: string; bpm?: number }) => {
    const track = currentTrack();
    if (!track) return;

    try {
      const updated = await apiClient.updateTrack(track.id, {
        title: meta.title || track.title,
        description: track.description || "",
        bpm: meta.bpm || track.bpm,
        graph_data: track.graph_data,
      });
      setCurrentTrack(updated);
    } catch (error) {
      console.error("Failed to update track meta:", error);
    }
  };

  onCleanup(() => {
    audioGraph.clear();
    shortcuts.clear();
    document.removeEventListener("keydown", shortcuts.handleKeyDown);
  });

  const value: StudioContextType = {
    canvasStore,
    audioGraph,
    mode,
    scenes,
    activeSceneId,
    createScene,
    updateScene,
    removeScene,
    activateScene,
    setMode: switchMode,
    isNodeMuted,
    toggleNodeMute,
    setNodeMuted,
    recordingStatus,
    recordedBlob,
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
    updateTrackMeta,
    startRecording,
    stopRecording,
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
