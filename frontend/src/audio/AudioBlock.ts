import { AudioContextManager } from "./AudioContextManager";
import type { AudioBlockParams } from "./types";

export abstract class AudioBlock {
  protected audioContext: AudioContext;
  protected inputNode: GainNode;
  protected outputNode: GainNode;
  public id: string;
  public type: string;
  public params: AudioBlockParams;

  constructor(id: string, type: string, params: AudioBlockParams = {}) {
    this.id = id;
    this.type = type;
    this.params = params;

    const manager = AudioContextManager.getInstance();
    this.audioContext = manager.getContext();

    this.inputNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();
  }

  abstract initialize(): void;
  abstract updateParam(key: string, value: number | string | boolean): void;

  connect(target: AudioBlock) {
    this.outputNode.connect(target.inputNode);
  }

  disconnect(target?: AudioBlock) {
    if (target) {
      this.outputNode.disconnect(target.inputNode);
    } else {
      this.outputNode.disconnect();
    }
  }

  destroy() {
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }

  getInputNode(): GainNode {
    return this.inputNode;
  }

  getOutputNode(): GainNode {
    return this.outputNode;
  }
}
