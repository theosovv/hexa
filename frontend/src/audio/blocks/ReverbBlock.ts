import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

const DEFAULT_REVERB_SIZE = 2.0;
const DEFAULT_REVERB_DECAY = 3.0;
const DEFAULT_REVERB_MIX = 0.3;
const DEFAULT_IMPULSE_URL = "";
const DEFAULT_NORMALIZE = true;

type ParamKey =
  | "size"
  | "decay"
  | "mix"
  | "impulseUrl"
  | "impulseId"
  | "impulseName"
  | "normalize";

export class ReverbBlock extends AudioBlock {
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private fallbackImpulse: AudioBuffer | null = null;
  private isUsingFallback = true;
  private currentImpulseUrl: string | null = null;
  private loadRequestId = 0;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "reverb", {
      size: DEFAULT_REVERB_SIZE,
      decay: DEFAULT_REVERB_DECAY,
      mix: DEFAULT_REVERB_MIX,
      impulseUrl: DEFAULT_IMPULSE_URL,
      impulseId: "",
      impulseName: "",
      normalize: DEFAULT_NORMALIZE,
      ...params,
    });

    this.params.size = this.toNumber(this.params.size, DEFAULT_REVERB_SIZE);
    this.params.decay = this.toNumber(this.params.decay, DEFAULT_REVERB_DECAY);
    this.params.impulseUrl =
      typeof this.params.impulseUrl === "string" ? this.params.impulseUrl : DEFAULT_IMPULSE_URL;

    this.convolver = this.audioContext.createConvolver();
    const normalize = this.toBoolean(this.params.normalize, DEFAULT_NORMALIZE);
    this.convolver.normalize = normalize;
    this.params.normalize = normalize;

    this.wetGain = this.audioContext.createGain();
    this.dryGain = this.audioContext.createGain();

    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.setMix(this.toNumber(this.params.mix, DEFAULT_REVERB_MIX));

    this.initialize();
  }

  initialize(): void {
    this.regenerateFallbackImpulse();

    const impulseUrl =
      typeof this.params.impulseUrl === "string" ? this.params.impulseUrl.trim() : "";
    if (impulseUrl) {
      this.loadImpulseResponse(impulseUrl).catch((error) => {
        console.error(`Failed to load impulse response (${impulseUrl}):`, error);
      });
    } else {
      this.params.impulseUrl = DEFAULT_IMPULSE_URL;
    }
  }

  private setMix(rawValue: number) {
    const mix = Math.min(Math.max(Number.isFinite(rawValue) ? rawValue : DEFAULT_REVERB_MIX, 0), 1);
    this.wetGain.gain.setValueAtTime(mix, this.audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(1 - mix, this.audioContext.currentTime);
    this.params.mix = mix;
  }

  private regenerateFallbackImpulse(): void {
    this.fallbackImpulse = this.generateImpulseResponseBuffer();
    if (!this.convolver.buffer || this.isUsingFallback) {
      this.applyImpulseBuffer(this.fallbackImpulse, true);
    }
  }

  private generateImpulseResponseBuffer(): AudioBuffer {
    const size = this.toNumber(this.params.size, DEFAULT_REVERB_SIZE);
    const decay = this.toNumber(this.params.decay, DEFAULT_REVERB_DECAY);

    const sampleRate = this.audioContext.sampleRate;
    const seconds = Math.max(decay, 0.1);
    const length = Math.max(Math.floor(sampleRate * seconds), 1);
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const random = Math.random() * 2 - 1;
        const envelope = Math.pow(1 - i / length, seconds);
        data[i] = random * envelope * size;
      }
    }

    return impulse;
  }

  private applyImpulseBuffer(buffer: AudioBuffer | null, isFallback = false): void {
    this.convolver.buffer = buffer;
    this.isUsingFallback = isFallback;
    if (isFallback) {
      this.currentImpulseUrl = null;
      this.params.impulseUrl = DEFAULT_IMPULSE_URL;
      this.params.impulseId = "";
      this.params.impulseName = "";
    }
  }

  private toNumber(value: number | string | boolean | undefined, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    if (typeof value === "boolean") {
      return value ? 1 : 0;
    }
    return fallback;
  }

  private toBoolean(value: number | string | boolean | undefined, fallback: boolean): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    if (typeof value === "number") return value !== 0;
    return fallback;
  }

  async loadImpulseResponse(url: string): Promise<void> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      throw new Error("Impulse URL cannot be empty.");
    }

    if (trimmedUrl === this.currentImpulseUrl && this.convolver.buffer) {
      return;
    }

    const requestId = ++this.loadRequestId;

    try {
      const response = await fetch(trimmedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch impulse response (status ${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.applyImpulseBuffer(audioBuffer);
      this.currentImpulseUrl = trimmedUrl;
      this.params.impulseUrl = trimmedUrl;
    } catch (error) {
      if (requestId === this.loadRequestId) {
        console.error(`Failed to load impulse response from ${trimmedUrl}:`, error);
        this.applyImpulseBuffer(this.fallbackImpulse ?? this.generateImpulseResponseBuffer(), true);
      }

      throw error instanceof Error
        ? error
        : new Error("Unknown error while loading impulse response.");
    }
  }

  async loadImpulseFromFile(file: File | Blob): Promise<void> {
    const requestId = ++this.loadRequestId;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.applyImpulseBuffer(audioBuffer);
      this.params.impulseUrl = DEFAULT_IMPULSE_URL;
      this.params.impulseId = "";
      this.params.impulseName = file instanceof File ? file.name : "Custom IR";
      this.currentImpulseUrl = null;
    } catch (error) {
      if (requestId === this.loadRequestId) {
        console.error("Failed to decode impulse response file:", error);
        this.applyImpulseBuffer(this.fallbackImpulse ?? this.generateImpulseResponseBuffer(), true);
      }

      throw error instanceof Error
        ? error
        : new Error("Unknown error while decoding impulse response file.");
    }
  }

  updateParam(key: ParamKey, value: number | string | boolean): void {
    switch (key) {
      case "mix": {
        this.setMix(this.toNumber(value, DEFAULT_REVERB_MIX));
        break;
      }
      case "size": {
        const size = this.toNumber(value, DEFAULT_REVERB_SIZE);
        this.params.size = size;
        this.regenerateFallbackImpulse();
        break;
      }
      case "decay": {
        const decay = this.toNumber(value, DEFAULT_REVERB_DECAY);
        this.params.decay = decay;
        this.regenerateFallbackImpulse();
        break;
      }
      case "impulseUrl": {
        const url = typeof value === "string" ? value.trim() : "";
        if (!url) {
          this.loadRequestId++;
          this.applyImpulseBuffer(this.fallbackImpulse ?? this.generateImpulseResponseBuffer(), true);
        } else {
          this.loadImpulseResponse(url).catch((error) => {
            console.error("Failed to load impulse response:", error);
          });
        }
        break;
      }
      case "impulseId":
      case "impulseName": {
        this.params[key] = value;
        break;
      }
      case "normalize": {
        const normalize = this.toBoolean(value, DEFAULT_NORMALIZE);
        this.convolver.normalize = normalize;
        this.params.normalize = normalize;
        break;
      }
    }
  }

  destroy(): void {
    this.loadRequestId++;
    this.convolver.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    this.convolver.buffer = null;
    this.fallbackImpulse = null;
    super.destroy();
  }
}
