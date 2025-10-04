import { Show } from "solid-js";
import { createSignal } from "solid-js";

import { css, cx } from "../../styled-system/css";
import type { DragHandler } from "../canvas/DragHandler";
import type { NodeData, Point } from "../canvas/types";

interface BlockNodeProps {
  node: NodeData;
  dragHandler: DragHandler;
  onMove: (id: string, delta: Point) => void;
  onDelete?: (id: string) => void;
  onPortClick?: (nodeId: string, port: "input" | "output", position: Point) => void;
}

const NODE_COLORS: Record<string, string> = {
  oscillator: "#8b5cf6",
  filter: "#3b82f6",
  delay: "#10b981",
  reverb: "#f59e0b",
  master: "#ef4444",
  default: "#6b7280",
};

export function BlockNode(props: BlockNodeProps) {
  const [isHovered, setIsHovered] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  const color = () => NODE_COLORS[props.node.type] || NODE_COLORS.default;

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();

    setIsDragging(true);

    const startPoint = { x: e.clientX, y: e.clientY };

    props.dragHandler.startDrag(props.node.id, startPoint);

    const onMove = (moveE: MouseEvent) => {
      const currentPoint = { x: moveE.clientX, y: moveE.clientY };

      props.dragHandler.drag(currentPoint, props.onMove);
    };

    const onUp = () => {
      setIsDragging(false);

      props.dragHandler.endDrag();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();

    props.onDelete?.(props.node.id);
  };

  const handleInputClick = (e: MouseEvent) => {
    e.stopPropagation();

    props.onPortClick?.(props.node.id, "input", {
      x: props.node.position.x + 10,
      y: props.node.position.y + 50,
    });
  };


  const handleOutputClick = (e: MouseEvent) => {
    e.stopPropagation();

    props.onPortClick?.(props.node.id, "output", {
      x: props.node.position.x + 130,
      y: props.node.position.y + 50,
    });
  };

  return (
    <g
      data-node-id={props.node.id}
      transform={`translate(${props.node.position.x}, ${props.node.position.y})`}
      class={nodeGroupStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shadow */}
      <rect
        width={140}
        height={90}
        rx={12}
        class={shadowStyle}
        transform="translate(0, 4)"
      />

      {/* Main body */}
      <rect
        width={140}
        height={90}
        rx={12}
        class={cx(
          nodeBodyStyle,
          isHovered() && nodeHoverStyle,
          isDragging() && nodeDraggingStyle,
        )}
        onMouseDown={handleMouseDown}
        style={{ stroke: color() }}
      />

      {/* Header with colored accent */}
      <rect
        width={140}
        height={30}
        rx={12}
        class={headerStyle}
        style={{ fill: color() }}
      />
      <rect
        width={140}
        height={15}
        y={15}
        class={headerBottomStyle}
        style={{ fill: color() }}
      />

      {/* Title */}
      <text x={70} y={20} class={titleStyle}>
        {props.node.type}
      </text>

      {/* Delete button (show on hover) */}
      <Show when={isHovered()}>
        <g class={deleteButtonStyle} onClick={handleDelete}>
          <text x={130} y={16} class={deleteTextStyle}>×</text>
        </g>
      </Show>

      {/* Input port */}
      <g
        class={portGroupStyle}
        onClick={handleInputClick}
      >
        {/* Invisible hit area */}
        <circle cx={10} cy={50} r={16} fill="transparent" />
        {/* Visible port */}
        <circle cx={10} cy={50} r={8} class={inputPortStyle} />
        <circle cx={10} cy={50} r={4} fill="#16a34a" />
      </g>

      {/* Output port */}
      <g
        class={portGroupStyle}
        onClick={handleOutputClick}
      >
        {/* Invisible hit area */}
        <circle cx={130} cy={50} r={16} fill="transparent" />
        {/* Visible port */}
        <circle cx={130} cy={50} r={8} class={outputPortStyle} />
        <circle cx={130} cy={50} r={4} fill="#dc2626" />
      </g>

      {/* Param display (optional) */}
      <Show when={Object.keys(props.node.params).length > 0}>
        <text x={70} y={70} class={paramStyle}>
          {Object.entries(props.node.params)[0]?.[0]}:
          {Object.entries(props.node.params)[0]?.[1] as string}
        </text>
      </Show>
    </g>
  );
}

const nodeGroupStyle = css({
  cursor: "move",
});

const shadowStyle = css({
  fill: "rgba(0, 0, 0, 0.3)",
  filter: "blur(8px)",
});

const nodeBodyStyle = css({
  fill: "#1a1a1a",
  strokeWidth: "3",
  transition: "all 0.2s",
});

const nodeHoverStyle = css({
  fill: "#2a2a2a",
  filter: "drop-shadow(0 0 8px rgba(74, 158, 255, 0.5))",
});

const nodeDraggingStyle = css({
  opacity: 0.8,
});

const headerStyle = css({
  opacity: 0.9,
});

const headerBottomStyle = css({
  opacity: 0.3,
});

const titleStyle = css({
  fill: "white",
  fontSize: "14px",
  fontWeight: "700",
  textAnchor: "middle",
  userSelect: "none",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const deleteButtonStyle = css({
  cursor: "pointer",
  opacity: 0.7,
  transition: "opacity 0.2s",
  "&:hover": {
    opacity: 1,
  },
});

const deleteCircleStyle = css({
  fill: "#ef4444",
  stroke: "#dc2626",
  strokeWidth: "2",
});

const deleteTextStyle = css({
  fill: "white",
  fontSize: "18px",
  fontWeight: "bold",
  textAnchor: "middle",
  userSelect: "none",
});

const inputPortStyle = css({
  fill: "#22c55e",
  stroke: "#16a34a",
  strokeWidth: "2",
});

const outputPortStyle = css({
  fill: "#ef4444",
  stroke: "#dc2626",
  strokeWidth: "2",
});

const paramStyle = css({
  fill: "#9ca3af",
  fontSize: "11px",
  textAnchor: "middle",
  userSelect: "none",
});

const portGroupStyle = css({
  cursor: "pointer",
  transition: "transform 0.2s",
});
