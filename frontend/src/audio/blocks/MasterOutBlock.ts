import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "volume";

export class MasterOutBlock extends AudioBlock {
  private analyser: AnalyserNode;
  private gainNode: GainNode;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "master", {
      volume: 0.8,
      ...params,
    });

    // Create gain for master volume
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.params.volume as number;

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Route: input -> gain -> analyser -> destination
    this.inputNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.initialize();
  }

  initialize() {
    // Master is always connected to destination
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    if (key === "volume") {
      this.gainNode.gain.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
      );
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
    this.gainNode.disconnect();
    this.analyser.disconnect();
    super.destroy();
  }
}
