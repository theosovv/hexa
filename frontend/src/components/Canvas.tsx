import { For, onMount } from "solid-js";

import { css } from "../../styled-system/css";
import { ConnectionManager } from "../canvas/ConnectionManager";
import { DragHandler } from "../canvas/DragHandler";
import { ViewportManager } from "../canvas/ViewportManager";
import { createCanvasStore } from "../canvas/store";
import type { Point } from "../canvas/types";

import { BlockNode } from "./BlockNode";
import { Connection } from "./Connection";

export function Canvas() {
  let svgRef: SVGSVGElement | undefined;

  const viewport = new ViewportManager();
  const dragHandler = new DragHandler();
  const connectionManager = new ConnectionManager();
  const store = createCanvasStore();

  const handleCanvasMouseDown = (e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();

      let lastX = e.clientX;
      let lastY = e.clientY;

      const onMove = (moveE: MouseEvent) => {
        viewport.pan(moveE.clientX - lastX, moveE.clientY - lastY);

        lastX = moveE.clientX;
        lastY = moveE.clientY;
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (!svgRef) return;

    const rect = svgRef.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    viewport.zoomAt(point, -e.deltaY * 0.001);
  };

  onMount(() => {
    store.addNode({
      id: "node-1",
      type: "oscillator",
      position: { x: 100, y: 100 },
      params: { frequency: 440 },
    });

    store.addNode({
      id: "node-2",
      type: "filter",
      position: { x: 400, y: 100 },
      params: { cutoff: 1000 },
    });

    store.addNode({
      id: "node-3",
      type: "master",
      position: { x: 700, y: 100 },
      params: {},
    });

    // Add test connection
    store.addConnection({
      id: "conn-1",
      from: "node-1",
      to: "node-2",
      fromPort: "output",
      toPort: "input",
    });
  });

  const moveNode = (id: string, delta: Point) => {
    store.moveNode(id, {
      x: delta.x / viewport.getZoom(),
      y: delta.y / viewport.getZoom(),
    });
  };

  const deleteNode = (id: string) => {
    store.removeNode(id);
  };

  const deleteConnection = (id: string) => {
    store.removeConnection(id);
  };

  return (
    <svg
      ref={svgRef}
      class={canvasStyle}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
    >
      {/* Grid background */}
      <defs>
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform={viewport.getTransform()}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <g transform={viewport.getTransform()}>
        {/* Connections layer */}
        <g class="connections">
          <For each={Array.from(store.connections().values())}>
            {(conn) => {
              const fromNode = store.nodes().get(conn.from);
              const toNode = store.nodes().get(conn.to);

              if (!fromNode || !toNode) return null;

              const fromPos = {
                x: fromNode.position.x + 120,
                y: fromNode.position.y + 40,
              };
              const toPos = {
                x: toNode.position.x,
                y: toNode.position.y + 40,
              };

              return (
                <Connection
                  id={conn.id}
                  from={fromPos}
                  to={toPos}
                  onDelete={deleteConnection}
                />
              );
            }}
          </For>

          {/* Temp connection while dragging */}
          {connectionManager.getTempConnection() && (
            <Connection
              id="temp"
              from={connectionManager.getTempConnection()!.fromPos}
              to={connectionManager.getTempConnection()!.toPos}
              isTemp
            />
          )}
        </g>

        {/* Nodes layer */}
        <g class="nodes">
          <For each={Array.from(store.nodes().values())}>
            {(node) => (
              <BlockNode
                node={node}
                dragHandler={dragHandler}
                onMove={moveNode}
                onDelete={deleteNode}
              />
            )}
          </For>
        </g>
      </g>
    </svg>
  );
}

const canvasStyle = css({
  width: "100%",
  height: "100vh",
  background: "#0a0a0a",
  cursor: "default",
});

