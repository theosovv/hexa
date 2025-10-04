import { createSignal } from "solid-js";

import { css, cx } from "../../styled-system/css";
import type { Point } from "../canvas/types";

interface ConnectionProps {
  id: string;
  from: Point;
  to: Point;
  isTemp?: boolean;
  onDelete?: (id: string) => void;
}

export function Connection(props: ConnectionProps) {
  const [isHovered, setIsHovered] = createSignal(false);

  const getBezierPath = (from: Point, to: Point): string => {
    const dx = to.x - from.x;
    const controlOffset = Math.abs(dx) * 0.5;

    return `M ${from.x} ${from.y} 
            C ${from.x + controlOffset} ${from.y}, 
              ${to.x - controlOffset} ${to.y}, 
              ${to.x} ${to.y}`;
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (!props.isTemp) {
      props.onDelete?.(props.id);
    }
  };

  return (
    <g>
      {/* Invisible wider path for easier clicking */}
      <path
        d={getBezierPath(props.from, props.to)}
        class={hitAreaStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />

      {/* Visible connection */}
      <path
        d={getBezierPath(props.from, props.to)}
        class={cx(
          props.isTemp ? tempConnectionStyle : connectionStyle,
          isHovered() && connectionHoverStyle,
        )}
      />
    </g>
  );
}

const hitAreaStyle = css({
  stroke: "transparent",
  strokeWidth: "20",
  fill: "none",
  cursor: "pointer",
});

const connectionStyle = css({
  stroke: "#4a9eff",
  strokeWidth: "3",
  fill: "none",
  filter: "drop-shadow(0 0 4px rgba(74, 158, 255, 0.5))",
  transition: "all 0.2s",
});

const connectionHoverStyle = css({
  stroke: "#60a5fa",
  strokeWidth: "4",
  filter: "drop-shadow(0 0 8px rgba(74, 158, 255, 0.8))",
});

const tempConnectionStyle = css({
  stroke: "#6b7280",
  strokeWidth: "3",
  strokeDasharray: "8,4",
  fill: "none",
  opacity: 0.6,
});
