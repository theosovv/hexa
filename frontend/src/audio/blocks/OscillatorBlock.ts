import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "type" | "frequency" | "detune" | "gain";

export class OscillatorBlock extends AudioBlock {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private baseGain = 0.5;
  private triggeredMode = false;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "oscillator", {
      type: "sine",
      frequency: 440,
      detune: 0,
      gain: 0.5,
      ...params,
    });

    this.baseGain = this.params.gain as number;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.baseGain;
    this.gainNode.connect(this.outputNode);

    this.inputNode.connect(this.gainNode);

    this.initialize();
  }

  initialize() {
  }

  isStarted(): boolean {
    return this.oscillator !== null;
  }

  start() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
    }

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.params.type as OscillatorType;
    this.oscillator.frequency.value = this.params.frequency as number;
    this.oscillator.detune.value = this.params.detune as number;

    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
  }

  setTriggeredMode(enabled: boolean) {
    this.triggeredMode = enabled;
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(enabled ? 0 : this.baseGain, now);
  }

  trigger(options?: { velocity?: number; duration?: number }) {
    if (!this.triggeredMode) return;

    if (!this.oscillator) {
      this.start();
    }

    const velocity = Math.max(0, Math.min(1, options?.velocity ?? 1));
    const duration = Math.max(0.01, options?.duration ?? 0.25);
    const attack = 0.01;
    const now = this.audioContext.currentTime;

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(this.baseGain * velocity, now + attack);
    this.gainNode.gain.linearRampToValueAtTime(0, now + attack + duration);
  }

  receiveTrigger(payload: { step: number; velocity: number }) {
    this.trigger({ velocity: payload.velocity });
  }

  stop() {
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.oscillator = null;
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "type":
        this.oscillator!.type = value as OscillatorType;
        break;
      case "frequency":
        this.oscillator?.frequency.setValueAtTime(value as number, this.audioContext.currentTime);
        break;
      case "detune":
        this.oscillator?.detune.setValueAtTime(value as number, this.audioContext.currentTime);
        break;
      case "gain":
        this.baseGain = value as number;
        if (!this.triggeredMode) {
          this.gainNode.gain.setValueAtTime(this.baseGain, this.audioContext.currentTime);
        }
        break;
    }
  }

  destroy() {
    this.stop();
    this.gainNode.disconnect();
    super.destroy();
  }
}
