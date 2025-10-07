import { For, Show } from "solid-js";

import { css } from "../../styled-system/css";
import { useStudio } from "../contexts/StudioContext";

import { ConnectionManager } from "./ConnectionManager";
import { DragHandler } from "./DragHandler";
import { ViewportManager } from "./ViewportManager";
import { BlockNode } from "./components/BlockNode";
import { Connection } from "./components/Connection";
import type { Point } from "./types";

export function Canvas() {
  let svgRef: SVGSVGElement | undefined;

  const studio = useStudio();
  const viewport = new ViewportManager();
  const dragHandler = new DragHandler();
  const connectionManager = new ConnectionManager();

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

  const moveNode = (id: string, delta: Point) => {
    studio.canvasStore.moveNode(id, {
      x: delta.x / viewport.getZoom(),
      y: delta.y / viewport.getZoom(),
    });
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    studio.selectNode(nodeId);
  };

  const handlePortClick = (nodeId: string, port: "input" | "output", position: Point) => {
    if (port === "output") {
      connectionManager.startConnection(nodeId, position);

      const onMove = (e: MouseEvent) => {
        if (!svgRef) return;
        const rect = svgRef.getBoundingClientRect();
        const worldPos = viewport.screenToWorld({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        connectionManager.updateConnection(worldPos);
      };

      const onUp = (e: MouseEvent) => {
        const target = e.target as SVGElement;
        const targetNodeId = target.closest("g[data-node-id]")?.getAttribute("data-node-id");

        if (targetNodeId && targetNodeId !== nodeId) {
          studio.addConnection(nodeId, targetNodeId);
        }

        connectionManager.cancelConnection();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!svgRef) return;

    const blockType = e.dataTransfer?.getData("blockType");
    if (!blockType) return;

    const rect = svgRef.getBoundingClientRect();
    const screenPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const worldPos = viewport.screenToWorld(screenPos);
    studio.addNode(blockType as any, worldPos);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "copy";
  };

  return (
    <svg
      ref={svgRef}
      class={canvasStyle}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
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
        <g class="connections">
          <For each={Array.from(studio.canvasStore.connections().values())}>
            {(conn) => {
              const fromNode = () => studio.canvasStore.nodes().get(conn.from);
              const toNode = () => studio.canvasStore.nodes().get(conn.to);

              return (
                <Show when={fromNode() && toNode()}>
                  {(() => {
                    const from = fromNode()!;
                    const to = toNode()!;

                    const fromPos = () => ({
                      x: from.position.x + 130,
                      y: from.position.y + 50,
                    });

                    const toPos = () => ({
                      x: to.position.x + 10,
                      y: to.position.y + 50,
                    });

                    return (
                      <Connection
                        id={conn.id}
                        from={fromPos()}
                        to={toPos()}
                        onDelete={studio.removeConnection}
                      />
                    );
                  })()}
                </Show>
              );
            }}
          </For>

          {connectionManager.getTempConnection() && (
            <Connection
              id="temp"
              from={connectionManager.getTempConnection()!.fromPos}
              to={connectionManager.getTempConnection()!.toPos}
              isTemp
            />
          )}
        </g>

        <g class="nodes">
          <For each={Array.from(studio.canvasStore.nodes().values())}>
            {(node) => (
              <BlockNode
                node={node}
                dragHandler={dragHandler}
                onMove={moveNode}
                onDelete={studio.removeNode}
                onPortClick={handlePortClick}
                onDoubleClick={handleNodeDoubleClick}
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
  marginLeft: "280px",
});
