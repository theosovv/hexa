import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type SequencerMessage =
  | { type: "set-steps"; payload: SequencerStep[] }
  | { type: "set-bpm"; payload: number }
  | { type: "set-steps-per-bar"; payload: number }
  | { type: "set-swing"; payload: number }
  | { type: "set-playing"; payload: boolean }
  | { type: "update-step"; payload: { index: number; step: Partial<SequencerStep> } }
  | { type: "reset" };

export interface SequencerStep {
  active: boolean;
  velocity: number;
  probability?: number;
}

interface SequencerParams extends AudioBlockParams {
  bpm: number;
  stepsPerBar: number;
  swing: number;
  playing: boolean;
  steps: SequencerStep[];
}

const WORKLET_NAME = "sequencer-processor";
const DEFAULT_STEPS_PER_BAR = 16;
const DEFAULT_BPM = 120;
const DEFAULT_SWING = 0;
const DEFAULT_PATTERN_LENGTH = 16;

const DEFAULT_STEPS: SequencerStep[] = Array.from({ length: DEFAULT_PATTERN_LENGTH }, (_, index) => ({
  active: index % 4 === 0,
  velocity: 1,
  probability: 1,
}));

let workletPromise: Promise<void> | null = null;

export class SequencerBlock extends AudioBlock {
  private workletNode: AudioWorkletNode | null = null;
  private isWorkletReady = false;
  private steps: SequencerStep[] = [...DEFAULT_STEPS];
  private onTriggerCallbacks = new Set<(step: number, velocity: number) => void>();
  private targets = new Map<string, AudioBlock>();

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "sequencer", {
      bpm: DEFAULT_BPM,
      stepsPerBar: DEFAULT_STEPS_PER_BAR,
      swing: DEFAULT_SWING,
      playing: false,
      steps: DEFAULT_STEPS,
      ...params,
    });

    this.steps = this.normalizeSteps((this.params.steps as SequencerStep[]) ?? DEFAULT_STEPS);
    this.initialize();
  }

  initialize(): void {
    void this.setupWorklet();
  }

  connectTarget(connectionId: string, block: AudioBlock) {
    this.targets.set(connectionId, block);

    const target = block as { setTriggeredMode?: (enabled: boolean) => void };
    target.setTriggeredMode?.(true);
  }

  disconnectTarget(connectionId: string) {
    const target = this.targets.get(connectionId) as { setTriggeredMode?: (enabled: boolean) => void } | undefined;
    target?.setTriggeredMode?.(false);
    this.targets.delete(connectionId);
  }

  updateParam(key: string, value: number | string | boolean | SequencerStep[]): void {
    switch (key) {
      case "bpm": {
        const bpm = this.toNumber(value, DEFAULT_BPM);
        this.params.bpm = bpm;
        this.postMessage({ type: "set-bpm", payload: bpm });
        break;
      }
      case "stepsPerBar": {
        const stepsPerBar = this.toNumber(value, DEFAULT_STEPS_PER_BAR);
        this.params.stepsPerBar = Math.max(1, Math.round(stepsPerBar));
        this.postMessage({ type: "set-steps-per-bar", payload: this.params.stepsPerBar });
        break;
      }
      case "swing": {
        const swing = this.toNumber(value, DEFAULT_SWING);
        const clamped = Math.max(0, Math.min(0.5, swing));
        this.params.swing = clamped;
        this.postMessage({ type: "set-swing", payload: clamped });
        break;
      }
      case "playing": {
        const playing = Boolean(value);
        this.params.playing = playing;
        this.postMessage({ type: "set-playing", payload: playing });
        break;
      }
      case "steps": {
        if (Array.isArray(value)) {
          this.steps = this.normalizeSteps(value as SequencerStep[]);
          this.params.steps = this.steps;
          this.postMessage({ type: "set-steps", payload: this.steps });
        }
        break;
      }
      default: {
        if (key.startsWith("step:")) {
          const [, indexStr] = key.split(":");
          const index = Number(indexStr);
          if (Number.isFinite(index) && Array.isArray(this.params.steps)) {
            const partial = value as Partial<SequencerStep>;
            this.updateStep(index, partial);
          }
        }
        break;
      }
    }
  }

  start(): void {
    this.updateParam("playing", true);
  }

  stop(): void {
    this.updateParam("playing", false);
  }

  setStep(index: number, step: Partial<SequencerStep>): void {
    this.updateStep(index, step);
  }

  onTrigger(callback: (step: number, velocity: number) => void): () => void {
    this.onTriggerCallbacks.add(callback);
    return () => this.onTriggerCallbacks.delete(callback);
  }

  destroy(): void {
    this.stop();
    this.workletNode?.disconnect();
    this.workletNode?.port.close();
    this.workletNode = null;
    this.targets.clear();
    this.onTriggerCallbacks.clear();
    super.destroy();
  }

  private async setupWorklet(): Promise<void> {
    if (this.isWorkletReady) return;

    await this.ensureWorkletModule();

    this.workletNode = new AudioWorkletNode(this.audioContext, WORKLET_NAME);
    this.workletNode.connect(this.outputNode);

    this.workletNode.port.onmessage = (event) => {
      const data = event.data as { type: string; step?: number; velocity?: number };
      if (data?.type === "trigger" && typeof data.step === "number") {
        const velocity = typeof data.velocity === "number" ? data.velocity : 1;
        this.handleTrigger(data.step, velocity);
      }
    };

    this.isWorkletReady = true;

    this.postMessage({ type: "set-bpm", payload: this.params.bpm as number });
    this.postMessage({ type: "set-steps-per-bar", payload: this.params.stepsPerBar as number });
    this.postMessage({ type: "set-swing", payload: this.params.swing as number });
    this.postMessage({ type: "set-steps", payload: this.steps });
    this.postMessage({ type: "set-playing", payload: Boolean(this.params.playing) });
  }

  private handleTrigger(step: number, velocity: number) {
    this.onTriggerCallbacks.forEach((cb) => cb(step, velocity));

    this.targets.forEach((block) => {
      const target = block as {
        receiveTrigger?: (payload: { step: number; velocity: number }) => void;
        trigger?: (options?: { velocity?: number }) => void;
      };

      if (target.receiveTrigger) {
        target.receiveTrigger({ step, velocity });
      } else if (target.trigger) {
        target.trigger({ velocity });
      }
    });
  }

  private async ensureWorkletModule(): Promise<void> {
    if (!workletPromise) {
      workletPromise = this.audioContext.audioWorklet.addModule(
        new URL("../worklets/SequencerProcessor.ts", import.meta.url),
      );
    }
    await workletPromise;
  }

  private postMessage(message: SequencerMessage): void {
    if (!this.workletNode) return;
    this.workletNode.port.postMessage(message);
  }

  private updateStep(index: number, changes: Partial<SequencerStep>): void {
    if (index < 0 || index >= this.steps.length) return;

    const current = this.steps[index];
    const next = this.normalizeStep({ ...current, ...changes });

    this.steps[index] = next;
    this.params.steps = this.steps;
    this.postMessage({ type: "update-step", payload: { index, step: next } });
  }

  private normalizeSteps(steps: SequencerStep[]): SequencerStep[] {
    if (!Array.isArray(steps) || steps.length === 0) {
      return [...DEFAULT_STEPS];
    }

    return steps.map((step) => this.normalizeStep(step));
  }

  private normalizeStep(step: SequencerStep): SequencerStep {
    return {
      active: Boolean(step?.active),
      velocity: this.toNumber(step?.velocity, 1, 0, 1),
      probability: this.toNumber(step?.probability ?? 1, 1, 0, 1),
    };
  }

  private toNumber(value: unknown, fallback: number, min?: number, max?: number): number {
    let next = fallback;

    if (typeof value === "number" && Number.isFinite(value)) {
      next = value;
    } else if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) next = parsed;
    }

    if (typeof min === "number") next = Math.max(min, next);
    if (typeof max === "number") next = Math.min(max, next);

    return next;
  }
}
