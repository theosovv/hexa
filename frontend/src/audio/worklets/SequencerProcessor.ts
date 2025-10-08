/// <reference lib="webworker" />

const DEFAULT_STEPS_PER_BAR = 16;
const DEFAULT_BPM = 120;
const DEFAULT_SWING = 0;
const DEFAULT_PROBABILITY = 1;

interface SequencerStep {
  active: boolean;
  velocity: number;
  probability?: number;
}

interface SequencerState {
  bpm: number;
  stepsPerBar: number;
  swing: number;
  steps: SequencerStep[];
  isPlaying: boolean;
}

const sharedState: SequencerState = {
  bpm: DEFAULT_BPM,
  stepsPerBar: DEFAULT_STEPS_PER_BAR,
  swing: DEFAULT_SWING,
  steps: [],
  isPlaying: false,
};

const STEP_CACHE = new Map<number, SequencerStep>();

const resolveStep = (index: number): SequencerStep => {
  if (!STEP_CACHE.has(index)) {
    const template =
      sharedState.steps[index] || ({ active: false, velocity: 1 } as SequencerStep);
    STEP_CACHE.set(index, { ...template });
  }

  return STEP_CACHE.get(index)!;
};

const updateStepCache = (steps: SequencerStep[]) => {
  STEP_CACHE.clear();
  steps.forEach((step, index) => {
    STEP_CACHE.set(index, { ...step });
  });
};

class SequencerProcessor extends AudioWorkletProcessor {
  private currentStep = 0;
  private nextStepFrame = 0;
  private framesPerStep = 0;
  private swingFrames = 0;
  private framesPerSecond: number;

  constructor() {
    super();

    this.framesPerSecond = sampleRate;

    this.recalculateTiming();

    this.port.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data);
    };
  }

  private recalculateTiming() {
    const secondsPerBeat = 60 / sharedState.bpm;
    const stepsPerBeat = sharedState.stepsPerBar / 4;
    const stepDurationSeconds = secondsPerBeat / stepsPerBeat;

    this.framesPerStep = stepDurationSeconds * this.framesPerSecond;
    this.swingFrames = this.framesPerStep * sharedState.swing;
  }

  private handleMessage(message: any) {
    const { type, payload } = message ?? {};

    switch (type) {
      case "set-steps": {
        const steps = Array.isArray(payload) ? payload : [];
        sharedState.steps = steps;
        updateStepCache(steps);
        break;
      }
      case "set-bpm": {
        const bpm = Number(payload);
        if (Number.isFinite(bpm) && bpm > 0) {
          sharedState.bpm = bpm;
          this.recalculateTiming();
        }
        break;
      }
      case "set-steps-per-bar": {
        const stepsPerBar = Number(payload);
        if (Number.isFinite(stepsPerBar) && stepsPerBar > 0) {
          sharedState.stepsPerBar = Math.max(1, Math.round(stepsPerBar));
          this.recalculateTiming();
        }
        break;
      }
      case "set-swing": {
        const swing = Number(payload);
        if (Number.isFinite(swing)) {
          sharedState.swing = Math.max(0, Math.min(0.5, swing));
          this.recalculateTiming();
        }
        break;
      }
      case "set-playing": {
        const playing = Boolean(payload);
        sharedState.isPlaying = playing;
        if (playing) {
          this.currentStep = 0;
          this.nextStepFrame = currentFrame;
        }
        break;
      }
      case "update-step": {
        const { index, step } = payload ?? {};
        if (typeof index === "number" && index >= 0 && step) {
          sharedState.steps[index] = { ...sharedState.steps[index], ...step };
          STEP_CACHE.set(index, { ...sharedState.steps[index] });
        }
        break;
      }
      case "reset":
        this.currentStep = 0;
        this.nextStepFrame = 0;
        break;
      default:
        break;
    }
  }

  private shouldTrigger(step: SequencerStep): boolean {
    if (!step.active) return false;

    const probability = Number.isFinite(step.probability)
      ? step.probability!
      : DEFAULT_PROBABILITY;

    if (probability >= 1) return true;
    if (probability <= 0) return false;

    return Math.random() <= probability;
  }

  private emitTrigger(stepIndex: number, frame: number, velocity: number) {
    this.port.postMessage({
      type: "trigger",
      step: stepIndex,
      time: frame / this.framesPerSecond,
      velocity,
    });
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>,
  ) {
    if (!sharedState.isPlaying || sharedState.steps.length === 0) {
      outputs.forEach((output) => output.forEach((channel) => channel.fill(0)));
      return true;
    }

    const output = outputs[0];
    const channel = output?.[0];
    if (channel) channel.fill(0);

    const framesInBlock = channel?.length ?? 128;
    const blockStartFrame = currentFrame;
    const blockEndFrame = blockStartFrame + framesInBlock;

    while (sharedState.isPlaying && sharedState.steps.length > 0 && this.nextStepFrame < blockEndFrame) {
      const processFrameIndex = Math.max(0, this.nextStepFrame - blockStartFrame);
      const step = resolveStep(this.currentStep);

      if (this.shouldTrigger(step)) {
        const velocity = Number.isFinite(step.velocity) ? step.velocity : 1;

        if (channel && processFrameIndex < channel.length) {
          channel[processFrameIndex] = 1;
        }

        this.emitTrigger(this.currentStep, this.nextStepFrame, velocity);
      }

      const baseInterval = this.framesPerStep;
      const isSwingStep = this.currentStep % 2 === 1;
      const interval = isSwingStep ? baseInterval + this.swingFrames : baseInterval - this.swingFrames;

      this.currentStep = (this.currentStep + 1) % sharedState.steps.length;
      this.nextStepFrame = this.nextStepFrame + Math.max(1, interval);
    }

    return true;
  }
}

registerProcessor("sequencer-processor", SequencerProcessor);

export {};
