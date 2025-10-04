import { createSignal, type Accessor, type Setter } from "solid-js";

import type { ConnectionData, Point } from "./types";

interface TempConnection {
  from: string;
  fromPos: Point;
  toPos: Point;
}

export class ConnectionManager {
  private tempConnection: Accessor<TempConnection | null>;
  private setTempConnection: Setter<TempConnection | null>;

  constructor() {
    [this.tempConnection, this.setTempConnection] = createSignal<TempConnection | null>(null);
  }

  getTempConnection = () => this.tempConnection();

  startConnection(nodeId: string, position: Point) {
    this.setTempConnection({
      from: nodeId,
      fromPos: position,
      toPos: position,
    });
  }

  updateConnection(position: Point) {
    const temp = this.tempConnection();

    if (!temp) return;

    this.setTempConnection({
      ...temp,
      toPos: position,
    });
  }

  endConnection(targetNodeId: string | null): ConnectionData | null {
    const temp = this.tempConnection();

    this.setTempConnection(null);

    if (!temp || !targetNodeId || temp.from === targetNodeId) return null;

    return {
      id: `${temp.from}-${targetNodeId}`,
      from: temp.from,
      to: targetNodeId,
      fromPort: "output",
      toPort: "input",
    };
  }

  cancelConnection() {
    this.setTempConnection(null);
  }

  getBezierPath(from: Point, to: Point): string {
    const dx = to.x - from.x;
    const controlOffset = Math.abs(dx) * 0.5;

    return `M ${from.x} ${from.y} 
            C ${from.x + controlOffset} ${from.y}, 
              ${to.x - controlOffset} ${to.y}, 
              ${to.x} ${to.y}`;
  }
}
