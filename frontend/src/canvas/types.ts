export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  type: string;
  position: Point;
  params: Record<string, unknown>;
}

export interface ConnectionData {
  id: string;
  from: string;
  to: string;
  fromPort: "output";
  toPort: "input";
  toPortIndex?: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasState {
  nodes: Map<string, NodeData>;
  connections: Map<string, ConnectionData>;
  viewport: Viewport;
}
