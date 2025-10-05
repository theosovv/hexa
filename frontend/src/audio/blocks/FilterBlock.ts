import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "type" | "frequency" | "q" | "gain";

export class FilterBlock extends AudioBlock {
  private filter: BiquadFilterNode;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "filter", {
      type: "lowpass",
      frequency: 1000,
      q: 1,
      gain: 0,
      ...params,
    });

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = this.params.type as BiquadFilterType;
    this.filter.frequency.value = this.params.frequency as number;
    this.filter.Q.value = this.params.q as number;
    this.filter.gain.value = this.params.gain as number;

    this.inputNode.connect(this.filter);
    this.filter.connect(this.outputNode);

    this.initialize();
  }

  initialize() {
    // Filter is always active
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "type":
        this.filter.type = value as BiquadFilterType;
        break;
      case "frequency":
        this.filter.frequency.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
      case "q":
        this.filter.Q.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
      case "gain":
        this.filter.gain.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
    }
  }

  destroy() {
    this.filter.disconnect();
    super.destroy();
  }
}
