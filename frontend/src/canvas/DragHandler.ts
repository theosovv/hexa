import { createSignal, type Accessor, type Setter } from "solid-js";

import type { Point } from "./types";

export class DragHandler {
  private isDragging: Accessor<boolean>;
  private setIsDragging: Setter<boolean>;
  private dragStart: Point | null = null;
  private dragTarget: string | null = null;

  constructor() {
    [this.isDragging, this.setIsDragging] = createSignal(false);
  }

  getIsDragging = () => this.isDragging();
  getDragTarget = () => this.dragTarget;

  startDrag(nodeId: string, startPoint: Point) {
    this.setIsDragging(true);
    this.dragStart = startPoint;
    this.dragTarget = nodeId;
  }

  drag(currentPoint: Point, onMove: (id: string, delta: Point) => void) {
    if (!this.isDragging() || !this.dragStart || !this.dragTarget) return;

    const delta = {
      x: currentPoint.x - this.dragStart.x,
      y: currentPoint.y - this.dragStart.y,
    };

    onMove(this.dragTarget, delta);
    this.dragStart = currentPoint;
  }

  endDrag() {
    this.setIsDragging(false);
    this.dragStart = null;
    this.dragTarget = null;
  }
}
