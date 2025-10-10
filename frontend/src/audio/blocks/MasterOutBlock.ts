import { AudioBlock } from "../AudioBlock";
import { AudioContextManager } from "../AudioContextManager";
import type { AudioBlockParams } from "../types";

type ParamsType = "volume" | "clipThreshold";

const MODULATION_SCALE = 0.5;
const DEFAULT_VOLUME = 0.8;
const DEFAULT_THRESHOLD = 0.8;

function createSoftClipCurve(amount: number, samples = 1024): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * 2 - 1;
    const scaled = x * amount;
    curve[i] = scaled / (1 + Math.abs(scaled));
  }
  return curve;
}

export class MasterOutBlock extends AudioBlock {
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private shaper: WaveShaperNode;
  private modulationNodes = new Map<string, GainNode>();

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "master", {
      volume: DEFAULT_VOLUME,
      clipThreshold: DEFAULT_THRESHOLD,
      ...params,
    });
    const manager = AudioContextManager.getInstance();

    // Create gain for master volume
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.params.volume as number;

    this.shaper = this.audioContext.createWaveShaper();
    this.shaper.curve = createSoftClipCurve(this.toNumber(this.params.clipThreshold, DEFAULT_THRESHOLD, 0.1, 4)) as Float32Array<ArrayBuffer>;
    this.shaper.oversample = "4x";

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Route: input -> gain -> analyser -> destination
    this.inputNode.connect(this.gainNode);
    this.gainNode.connect(this.shaper);
    this.shaper.connect(this.analyser);
    this.analyser.connect(this.outputNode);
    this.outputNode.connect(this.audioContext.destination);
    this.outputNode.connect(manager.getStreamDestination());
  }

  initialize() {
    // Master is always connected to destination
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    switch (key) {
      case "volume": {
        const volume = this.toNumber(value, DEFAULT_VOLUME, 0, 2);
        this.params.volume = volume;
        this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        break;
      }
      case "clipThreshold": {
        const amount = this.toNumber(value, DEFAULT_THRESHOLD, 0.1, 4);
        this.params.clipThreshold = amount;
        this.shaper.curve = createSoftClipCurve(amount) as Float32Array<ArrayBuffer>;
        break;
      }
    }
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  getFrequencyData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getTimeDomainData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  destroy() {
    this.inputNode.disconnect();
    this.gainNode.disconnect();
    this.shaper.disconnect();
    this.analyser.disconnect();
    super.destroy();
  }

  registerInputConnection(connectionId: string, fromBlock: AudioBlock, targetIndex = 0): AudioNode | AudioParam {
    if (fromBlock.type === "lfo") {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = MODULATION_SCALE;
      gainNode.connect(this.gainNode.gain);

      this.modulationNodes.set(connectionId, gainNode);
      return gainNode;
    }

    return super.registerInputConnection(connectionId, fromBlock, targetIndex);
  }

  releaseInputConnection(connectionId: string): void {
    const gainNode = this.modulationNodes.get(connectionId);
    if (gainNode) {
      gainNode.disconnect();
      this.modulationNodes.delete(connectionId);
      return;
    }

    super.releaseInputConnection(connectionId);
  }

  private toNumber(value: unknown, fallback: number, min = -Infinity, max = Infinity): number {
    let num = fallback;
    if (typeof value === "number" && Number.isFinite(value)) num = value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) num = parsed;
    }
    return Math.min(max, Math.max(min, num));
  }
}
