import { AudioContextManager } from "./AudioContextManager";
import type { SequencerStep } from "./blocks/SequencerBlock";
import type { AudioBlockParamPrimitive, AudioBlockParams } from "./types";

type ConnectionEndpoint = AudioNode | AudioParam;

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
  abstract updateParam(
    key: string,
    value: SequencerStep[]
      | AudioBlockParamPrimitive
      | AudioBlockParamPrimitive[]
      | Record<string, AudioBlockParamPrimitive>
    ): void;

  connect(target: AudioBlock, connectionId: string, targetIndex?: number) {
    const destination = target.registerInputConnection(connectionId, this, targetIndex);

    if (this.isAudioParam(destination)) {
      this.outputNode.connect(destination);
    } else {
      this.outputNode.connect(destination);
    }
  }

  disconnect(target?: AudioBlock, connectionId?: string) {
    if (target) {
      const endpoint = target.registerInputConnection(connectionId ?? "", this);
      if (this.isAudioParam(endpoint)) {
        this.outputNode.disconnect(endpoint);
      } else {
        this.outputNode.disconnect(endpoint);
      }
      target.releaseInputConnection(connectionId ?? "");
    } else {
      this.outputNode.disconnect();
    }
  }

  registerInputConnection(_connectionId: string, _fromBlock: AudioBlock, _targetIndex?: number): ConnectionEndpoint {
    return this.inputNode;
  }

  releaseInputConnection(_connectionId: string): void {
    // для большинства блоков ничего делать не нужно
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

  protected isAudioParam(endpoint: ConnectionEndpoint): endpoint is AudioParam {
    return typeof (endpoint as AudioParam).setValueAtTime === "function";
  }
}
