import { createSignal, onCleanup, onMount } from "solid-js";
import { css, cx } from "../../styled-system/css";

interface KnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  size?: number;
  color?: string;
}

export function Knob(props: KnobProps) {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const size = () => props.size ?? 60;
  const color = () => props.color ?? "#4a9eff";

  const [isDragging, setIsDragging] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createSignal(0);

  const valueToAngle = (value: number): number => {
    const normalized = (value - min()) / (max() - min());

    return normalized * 270 - 135;
  };

  const angle = () => valueToAngle(props.value);

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();

    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(props.value);

    document.body.style.cursor = "ns-resize";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    const deltaY = startY() - e.clientY; // Inverted (up = increase)
    const deltaValue = (deltaY / 100) * (max() - min());
    let newValue = startValue() + deltaValue;

    newValue = Math.max(min(), Math.min(max(), newValue));
    newValue = Math.round(newValue / step()) * step();

    props.onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  const radius = () => size() / 2;
  const strokeWidth = 4;
  const innerRadius = () => radius() - strokeWidth * 2;
  const circumference = () => 2 * Math.PI * innerRadius();
  const arcLength = () => (270 / 360) * circumference();

  return (
    <div class={containerStyle}>
      <svg
        width={size()}
        height={size()}
        class={cx(svgStyle, isDragging() && draggingStyle)}
        onMouseDown={handleMouseDown}
      >
        {/* Background arc */}
        <circle
          cx={radius()}
          cy={radius()}
          r={innerRadius()}
          fill="none"
          stroke="#2a2a2a"
          stroke-width={strokeWidth}
          stroke-dasharray={`${arcLength()} ${circumference()}`}
          stroke-dashoffset={-circumference() / 4 - arcLength() / 2}
          stroke-linecap="round"
        />

        {/* Value arc */}
        <circle
          cx={radius()}
          cy={radius()}
          r={innerRadius()}
          fill="none"
          stroke={color()}
          stroke-width={strokeWidth}
          stroke-dasharray={`${arcLength()} ${circumference()}`}
          stroke-dashoffset={
            -circumference() / 4 - arcLength() / 2 - (arcLength() * (props.value - min())) / (max() - min())
          }
          stroke-linecap="round"
          class={arcStyle}
        />

        {/* Center circle */}
        <circle cx={radius()} cy={radius()} r={innerRadius() - strokeWidth} fill="#1a1a1a" />

        {/* Indicator line */}
        <line
          x1={radius()}
          y1={radius()}
          x2={radius() + (innerRadius() - strokeWidth * 2) * Math.sin((angle() * Math.PI) / 180)}
          y2={radius() - (innerRadius() - strokeWidth * 2) * Math.cos((angle() * Math.PI) / 180)}
          stroke={color()}
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>

      {/* Label */}
      <div class={labelStyle}>{props.label}</div>

      {/* Value display */}
      <div class={valueStyle}>
        {props.value.toFixed(step() < 1 ? 1 : 0)}
        {props.unit && <span class={unitStyle}>{props.unit}</span>}
      </div>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  userSelect: "none",
});

const svgStyle = css({
  cursor: "ns-resize",
  transition: "transform 0.1s",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const draggingStyle = css({
  transform: "scale(1.1)",
});

const arcStyle = css({
  filter: "drop-shadow(0 0 4px currentColor)",
});

const labelStyle = css({
  fontSize: "12px",
  fontWeight: "600",
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const valueStyle = css({
  fontSize: "14px",
  fontWeight: "700",
  color: "white",
});

const unitStyle = css({
  fontSize: "10px",
  color: "#6b7280",
  marginLeft: "2px",
});
