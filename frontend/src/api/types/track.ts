export interface Track {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  bpm: number;
  graph_data: GraphData;
  created_at: string;
  updated_at: string;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    params: Record<string, unknown>;
  }>;
  connections: Array<{
    id: string;
    from: string;
    to: string;
    to_port_index?: number;
  }>;
}

export interface CreateTrackInput {
  title: string;
  description?: string;
  bpm?: number;
  graph_data: GraphData;
}

export interface UpdateTrackInput {
  title: string;
  description?: string;
  bpm?: number;
  graph_data: GraphData;
}
