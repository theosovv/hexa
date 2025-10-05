import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "type" | "frequency" | "detune" | "gain";

export class OscillatorBlock extends AudioBlock {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "oscillator", {
      type: "sine",
      frequency: 440,
      detune: 0,
      gain: 0.5,
      ...params,
    });

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.params.gain as number;
    this.gainNode.connect(this.outputNode);

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

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "type":
        if (this.oscillator) {
          this.oscillator.type = value as OscillatorType;
        }
        break;
      case "frequency":
        if (this.oscillator) {
          this.oscillator.frequency.setValueAtTime(
          value as number,
          this.audioContext.currentTime,
          );
        }
        break;
      case "detune":
        if (this.oscillator) {
          this.oscillator.detune.setValueAtTime(
          value as number,
          this.audioContext.currentTime,
          );
        }
        break;
      case "gain":
        this.gainNode.gain.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
    }
  }

  destroy() {
    this.stop();
    this.gainNode.disconnect();
    super.destroy();
  }
}
