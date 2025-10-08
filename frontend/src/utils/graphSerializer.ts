import type { GraphData } from "../api/types/track";
import type { ConnectionData, NodeData } from "../canvas/types";

export function serializeGraph(
  nodes: Map<string, NodeData>,
  connections: Map<string, ConnectionData>,
): GraphData {
  return {
    nodes: Array.from(nodes.values()).map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      params: node.params,
    })),
    connections: Array.from(connections.values()).map((conn) => ({
      id: conn.id,
      from: conn.from,
      to: conn.to,
      to_port_index: conn.toPortIndex,
    })),
  };
}

export function deserializeGraph(graphData: GraphData): {
  nodes: Map<string, NodeData>;
  connections: Map<string, ConnectionData>;
} {
  const nodes = new Map<string, NodeData>();
  const connections = new Map<string, ConnectionData>();

  graphData.nodes.forEach((node) => {
    nodes.set(node.id, {
      id: node.id,
      type: node.type,
      position: node.position,
      params: node.params,
    });
  });

  graphData.connections.forEach((conn) => {
    connections.set(conn.id, {
      id: conn.id,
      from: conn.from,
      to: conn.to,
      fromPort: "output",
      toPort: "input",
      toPortIndex: conn.to_port_index,
    });
  });

  return { nodes, connections };
}
