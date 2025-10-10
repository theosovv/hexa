import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "time" | "feedback" | "mix";
type ModTarget = "time" | "feedback" | "mix";

const MODULATION_SCALE: Record<ModTarget, number> = {
  time: 0.25,
  feedback: 0.5,
  mix: 0.5,
};

export class DelayBlock extends AudioBlock {
  private delay: DelayNode;
  private feedback: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private modulationNodes = new Map<string, { gain: GainNode; target: ModTarget }>();

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "delay", {
      time: 0.25,
      feedback: 0.3,
      mix: 0.5,
      ...params,
    });

    this.delay = this.audioContext.createDelay(5.0);
    this.delay.delayTime.value = this.params.time as number;

    this.feedback = this.audioContext.createGain();
    this.feedback.gain.value = this.params.feedback as number;

    this.wetGain = this.audioContext.createGain();
    this.wetGain.gain.value = this.params.mix as number;

    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = 1 - (this.params.mix as number);

    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.initialize();
  }

  initialize() {
    // Delay is always active
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "time":
        this.delay.delayTime.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
      case "feedback":
        this.feedback.gain.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        break;
      case "mix":
        this.wetGain.gain.setValueAtTime(
        value as number,
        this.audioContext.currentTime,
        );
        this.dryGain.gain.setValueAtTime(
          1 - (value as number),
          this.audioContext.currentTime,
        );
        break;
    }
  }

  destroy() {
    this.delay.disconnect();
    this.feedback.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    super.destroy();
  }

  registerInputConnection(connectionId: string, fromBlock: AudioBlock, targetIndex = 0): AudioNode | AudioParam {
    if (fromBlock.type === "lfo") {
      const targets: ModTarget[] = ["time", "feedback", "mix"];
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

  private getParamByTarget(target: ModTarget): AudioParam {
    switch (target) {
      case "time":
        return this.delay.delayTime;
      case "feedback":
        return this.feedback.gain;
      default:
        return this.wetGain.gain;
    }
  }
}
