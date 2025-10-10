import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type Waveform = OscillatorType;
type ParamKey = "frequency" | "depth" | "offset" | "waveform" | "active";

const DEFAULT_FREQUENCY = 2;
const DEFAULT_DEPTH = 0.5;
const DEFAULT_OFFSET = 0.5;
const DEFAULT_WAVEFORM: Waveform = "sine";

export class LFOBlock extends AudioBlock {
  private oscillator: OscillatorNode;
  private depthGain: GainNode;
  private offsetSource: ConstantSourceNode;
  private isStarted = false;
  private currentDepth = DEFAULT_DEPTH;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "lfo", {
      frequency: DEFAULT_FREQUENCY,
      depth: DEFAULT_DEPTH,
      offset: DEFAULT_OFFSET,
      waveform: DEFAULT_WAVEFORM,
      active: true,
      ...params,
    });

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.params.waveform as Waveform;
    this.oscillator.frequency.value = this.params.frequency as number;

    this.depthGain = this.audioContext.createGain();
    this.currentDepth = this.toNumber(this.params.depth as number, DEFAULT_DEPTH, 0, 1);
    this.depthGain.gain.value = this.currentDepth;

    this.offsetSource = this.audioContext.createConstantSource();
    this.offsetSource.offset.value = this.toNumber(this.params.offset as number, DEFAULT_OFFSET, -1, 1);

    this.oscillator.connect(this.depthGain);
    this.depthGain.connect(this.outputNode);
    this.offsetSource.connect(this.outputNode);

    this.startSources();
  }

  initialize(): void {
  }

  updateParam(key: ParamKey, value: number | string | boolean): void {
    switch (key) {
      case "frequency": {
        const freq = this.toNumber(value, DEFAULT_FREQUENCY, 0.01, 40);
        this.params.frequency = freq;
        this.oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        break;
      }
      case "depth": {
        const depth = this.toNumber(value, DEFAULT_DEPTH, 0, 1);
        this.params.depth = depth;
        this.currentDepth = depth;
        this.applyDepth();
        break;
      }
      case "offset": {
        const offset = this.toNumber(value, DEFAULT_OFFSET, -1, 1);
        this.params.offset = offset;
        this.offsetSource.offset.setValueAtTime(offset, this.audioContext.currentTime);
        break;
      }
      case "waveform": {
        const waveform = this.toWaveform(value);
        this.params.waveform = waveform;
        this.oscillator.type = waveform;
        break;
      }
      case "active": {
        const active = Boolean(value);
        this.params.active = active;
        this.applyDepth();
        break;
      }
    }
  }

  destroy(): void {
    try {
      this.oscillator.stop();
    } catch {
      // ignore double stop
    }
    this.oscillator.disconnect();
    try {
      this.offsetSource.stop();
    } catch {
      // ignore double stop
    }
    this.offsetSource.disconnect();
    this.depthGain.disconnect();
    super.destroy();
  }

  private startSources() {
    if (this.isStarted) return;

    this.oscillator.start();
    this.offsetSource.start();
    this.isStarted = true;
    this.applyDepth();
  }

  private applyDepth() {
    const depth = this.params.active ? this.currentDepth : 0;
    this.depthGain.gain.setValueAtTime(depth, this.audioContext.currentTime);
  }

  private toNumber(
    value: number | string | boolean,
    fallback: number,
    min?: number,
    max?: number,
  ): number {
    let num = fallback;
    if (typeof value === "number" && Number.isFinite(value)) num = value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) num = parsed;
    }

    if (typeof min === "number") num = Math.max(min, num);
    if (typeof max === "number") num = Math.min(max, num);

    return num;
  }

  private toWaveform(value: number | string | boolean): Waveform {
    const candidates: Waveform[] = ["sine", "triangle", "square", "sawtooth"];
    if (typeof value === "string" && candidates.includes(value as Waveform)) {
      return value as Waveform;
    }
    return DEFAULT_WAVEFORM;
  }
}
