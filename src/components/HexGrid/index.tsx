import { useEffect, useRef, useState } from "react";
import { useGridStore } from "../../store/gridStore";
import { Canvas } from "./styled";

const HEX_RADIUS = 40;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
const HEX_WIDTH = 2 * HEX_RADIUS;

export function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { activeCells, toggleCell, isCellActive } = useGridStore();

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getVisibleCells = (width: number, height: number) => {
    const cells: Array<{ q: number; r: number; x: number; y: number }> = [];

    const qRange = Math.ceil(width / (HEX_WIDTH * 0.75)) + 10;
    const rRange = Math.ceil(height / HEX_HEIGHT) + qRange + 10;

    const centerQ = Math.round(-offset.x / (HEX_WIDTH * 0.75));
    const centerR = Math.round(-offset.y / HEX_HEIGHT);

    for (let q = centerQ - qRange; q <= centerQ + qRange; q++) {
      for (let r = centerR - rRange; r <= centerR + rRange; r++) {
        const x = width / 2 + offset.x + HEX_WIDTH * 0.75 * q;
        const y = height / 2 + offset.y + HEX_HEIGHT * (r + q / 2);

        if (x > -HEX_WIDTH && x < width + HEX_WIDTH && y > -HEX_HEIGHT && y < height + HEX_HEIGHT) {
          cells.push({ q, r, x, y });
        }
      }
    }

    return cells;
  };

  const drawHex = (ctx: CanvasRenderingContext2D, x: number, y: number, active: boolean) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + HEX_RADIUS * Math.cos(angle);
      const hy = y + HEX_RADIUS * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = active ? "#00ff88" : "#2a2a2a";
    ctx.fillStyle = active ? "#00ff8833" : "#0a0a0a";
    ctx.lineWidth = active ? 2.5 : 0.5;
    ctx.fill();
    ctx.stroke();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const visibleCells = getVisibleCells(canvas.width, canvas.height);

    visibleCells.forEach(({ q, r, x, y }) => {
      const active = isCellActive(q, r);
      drawHex(ctx, x, y, active);
    });
  };

  useEffect(() => {
    render();
  }, [activeCells, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = e.clientX;
    const y = e.clientY;

    const visibleCells = getVisibleCells(canvas.width, canvas.height);

    const clickedCell = visibleCells.find(({ x: cx, y: cy }) => {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return dist < HEX_RADIUS;
    });

    if (clickedCell) {
      toggleCell(clickedCell.q, clickedCell.r);
    }
  };

  return (
    <Canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      $isDragging={isDragging}
    />
  );
}
