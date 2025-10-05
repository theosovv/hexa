import { createSignal, onCleanup, onMount } from "solid-js";

import { css, cx } from "../../styled-system/css";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  color?: string;
}

export function Slider(props: SliderProps) {
  let trackRef: HTMLDivElement | undefined;

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const orientation = () => props.orientation ?? "vertical";
  const color = () => props.color ?? "#4a9eff";

  const [isDragging, setIsDragging] = createSignal(false);

  const percentage = () => ((props.value - min()) / (max() - min())) * 100;

  const updateValue = (clientX: number, clientY: number) => {
    if (!trackRef) return;

    const rect = trackRef.getBoundingClientRect();
    let normalized: number;

    if (orientation() === "vertical") {
      normalized = 1 - (clientY - rect.top) / rect.height;
    } else {
      normalized = (clientX - rect.left) / rect.width;
    }

    normalized = Math.max(0, Math.min(1, normalized));
    let newValue = min() + normalized * (max() - min());
    newValue = Math.round(newValue / step()) * step();

    props.onChange(newValue);
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    updateValue(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  return (
    <div
      class={cx(
        containerStyle,
        orientation() === "vertical" ? verticalContainerStyle : horizontalContainerStyle,
      )}
    >
      {/* Label */}
      <div class={labelStyle}>{props.label}</div>

      {/* Track */}
      <div
        ref={trackRef}
        class={cx(
          trackStyle,
          orientation() === "vertical" ? verticalTrackStyle : horizontalTrackStyle,
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          class={cx(fillStyle, orientation() === "vertical" ? verticalFillStyle : horizontalFillStyle)}
          style={{
            [orientation() === "vertical" ? "height" : "width"]: `${percentage()}%`,
            background: color(),
          }}
        />

        {/* Thumb */}
        <div
          class={cx(thumbStyle, isDragging() && thumbDraggingStyle)}
          style={{
            [orientation() === "vertical" ? "bottom" : "left"]: `${percentage()}%`,
            background: color(),
          }}
        />
      </div>

      {/* Value */}
      <div class={valueStyle}>
        {props.value.toFixed(step() < 1 ? 1 : 0)}
        {props.unit && <span class={unitStyle}>{props.unit}</span>}
      </div>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  userSelect: "none",
});

const verticalContainerStyle = css({
  flexDirection: "column",
});

const horizontalContainerStyle = css({
  flexDirection: "row",
});

const labelStyle = css({
  fontSize: "12px",
  fontWeight: "600",
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const trackStyle = css({
  position: "relative",
  background: "#2a2a2a",
  borderRadius: "999px",
  cursor: "pointer",
  "&:hover": {
    background: "#3a3a3a",
  },
});

const verticalTrackStyle = css({
  width: "6px",
  height: "120px",
});

const horizontalTrackStyle = css({
  width: "120px",
  height: "6px",
});

const fillStyle = css({
  position: "absolute",
  borderRadius: "999px",
  pointerEvents: "none",
});

const verticalFillStyle = css({
  bottom: 0,
  left: 0,
  right: 0,
});

const horizontalFillStyle = css({
  top: 0,
  left: 0,
  bottom: 0,
});

const thumbStyle = css({
  position: "absolute",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  border: "2px solid white",
  transform: "translate(-50%, 50%)",
  cursor: "grab",
  transition: "transform 0.1s",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  "&:hover": {
    transform: "translate(-50%, 50%) scale(1.1)",
  },
});

const thumbDraggingStyle = css({
  cursor: "grabbing",
  transform: "translate(-50%, 50%) scale(1.2)",
});

const valueStyle = css({
  fontSize: "14px",
  fontWeight: "700",
  color: "white",
  minWidth: "50px",
  textAlign: "center",
});

const unitStyle = css({
  fontSize: "10px",
  color: "#6b7280",
  marginLeft: "2px",
});
