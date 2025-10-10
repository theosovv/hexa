export interface SceneState {
  nodeParams: Record<string, Record<string, unknown>>;
  mutedNodeIds: string[];
}

export interface Scene {
  id: string;
  track_id: string;
  name: string;
  position: number;
  state_data: SceneState;
  created_at: string;
}
