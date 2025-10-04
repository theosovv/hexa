import { createSignal, type Accessor, type Setter } from "solid-js";

import type { Point, Viewport } from "./types";

export class ViewportManager {
  private x: Accessor<number>;
  private setX: Setter<number>;
  private y: Accessor<number>;
  private setY: Setter<number>;
  private zoom: Accessor<number>;
  private setZoom: Setter<number>;

  private minZoom = 0.1;
  private maxZoom = 2.5;

  constructor() {
    [this.x, this.setX] = createSignal(0);
    [this.y, this.setY] = createSignal(0);
    [this.zoom, this.setZoom] = createSignal(1);
  }

  getX = () => this.x();
  getY = () => this.y();
  getZoom = () => this.zoom();

  getViewport = (): Viewport => ({
    x: this.x(),
    y: this.y(),
    zoom: this.zoom(),
  });

  pan(dx: number, dy: number) {
    this.setX(this.x() + dx);
    this.setY(this.y() + dy);
  }

  zoomAt(point: Point, delta: number) {
    const newZoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom() + delta),
    );

    const scale = newZoom / this.zoom();

    this.setX(point.x - (point.x - this.x()) * scale);
    this.setY(point.y - (point.y - this.y()) * scale);
    this.setZoom(newZoom);
  }

  screenToWorld(point: Point): Point {
    return {
      x: (point.x - this.x()) / this.zoom(),
      y: (point.y - this.y()) / this.zoom(),
    };
  }

  worldToScreen(point: Point): Point {
    return {
      x: point.x * this.zoom() + this.x(),
      y: point.y * this.zoom() + this.y(),
    };
  }

  getTransform(): string {
    return `translate(${this.x()}, ${this.y()}) scale(${this.zoom()})`;
  }

  reset() {
    this.setX(0);
    this.setY(0);
    this.setZoom(1);
  }
}
