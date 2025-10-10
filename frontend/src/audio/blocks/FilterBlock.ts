import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "type" | "frequency" | "q" | "gain";
type ModTarget = "frequency" | "q" | "gain";

const MODULATION_SCALE: Record<ModTarget, number> = {
  frequency: 400,
  q: 5,
  gain: 12,
};

export class FilterBlock extends AudioBlock {
  private filter: BiquadFilterNode;
  private modulationNodes = new Map<string, { gain: GainNode; target: ModTarget }>();

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

  registerInputConnection(
    connectionId: string,
    fromBlock: AudioBlock,
    targetIndex = 0,
  ): AudioNode | AudioParam {
    if (fromBlock.type === "lfo") {
      const targets: ModTarget[] = ["frequency", "q", "gain"];
      const target = targets[Math.min(targets.length - 1, Math.max(0, targetIndex))];
      const param = this.getParamByTarget(target);

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = MODULATION_SCALE[target];
      gainNode.connect(param);

      this.modulationNodes.set(connectionId, { gain: gainNode, target });

      return gainNode;
    }

    return super.registerInputConnection(connectionId, fromBlock, targetIndex);
  }

  releaseInputConnection(connectionId: string): void {
    const entry = this.modulationNodes.get(connectionId);
    if (entry) {
      entry.gain.disconnect();
      this.modulationNodes.delete(connectionId);
      return;
    }

    super.releaseInputConnection(connectionId);
  }

  destroy() {
    this.filter.disconnect();
    super.destroy();
  }

  private getParamByTarget(target: ModTarget): AudioParam {
    switch (target) {
      case "frequency":
        return this.filter.frequency;
    }
    if (target === "q") return this.filter.Q;
    return this.filter.gain;
  }
}
