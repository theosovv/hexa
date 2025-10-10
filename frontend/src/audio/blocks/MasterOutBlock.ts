import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "volume";

const MODULATION_SCALE = 0.5;

export class MasterOutBlock extends AudioBlock {
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private modulationNodes = new Map<string, GainNode>();

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
}
