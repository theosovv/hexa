import { createSignal } from "solid-js";

import type { ConnectionData, NodeData } from "./types";

export function createCanvasStore() {
  const [nodes, setNodes] = createSignal<Map<string, NodeData>>(new Map());
  const [connections, setConnections] = createSignal<Map<string, ConnectionData>>(new Map());

  const addNode = (node: NodeData) => {
    setNodes((prev) => {
      const next = new Map(prev);

      next.set(node.id, node);

      return next;
    });
  };

  const removeNode = (id: string) => {
    setNodes((prev) => {
      const next = new Map(prev);

      next.delete(id);
      return next;
    });

    setConnections((prev) => {
      const next = new Map(prev);

      Array.from(next.values()).forEach((conn) => {
        if (conn.from === id || conn.to === id) {
          next.delete(conn.id);
        }
      });

      return next;
    });
  };

  const updateNode = (id: string, updates: Partial<NodeData>) => {
    setNodes((prev) => {
      const next = new Map(prev);
      const node = next.get(id);

      if (node) {
        next.set(id, { ...node, ...updates });
      }

      return next;
    });
  };

  const moveNode = (id: string, delta: { x: number; y: number }) => {
    setNodes((prev) => {
      const next = new Map(prev);
      const node = next.get(id);

      if (node) {
        next.set(id, {
          ...node,
          position: {
            x: node.position.x + delta.x,
            y: node.position.y + delta.y,
          },
        });
      }

      return next;
    });
  };

  const addConnection = (connection: ConnectionData) => {
    setConnections((prev) => {
      const next = new Map(prev);

      next.set(connection.id, connection);

      return next;
    });
  };

  const removeConnection = (id: string) => {
    setConnections((prev) => {
      const next = new Map(prev);

      next.delete(id);

      return next;
    });
  };

  return {
    nodes,
    connections,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    addConnection,
    removeConnection,
  };
}
