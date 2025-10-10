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
  private connectionEndpoints = new Map<string, ConnectionEndpoint>();
  private muted = false;

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
    const endpoint = target.registerInputConnection(connectionId, this, targetIndex);
    if (!endpoint) return;

    this.connectionEndpoints.set(connectionId, endpoint);

    if (this.isAudioParam(endpoint)) {
      this.outputNode.connect(endpoint);
    } else {
      this.outputNode.connect(endpoint);
    }
  }

  disconnect(target?: AudioBlock, connectionId?: string) {
    if (target && connectionId) {
      const endpoint = this.connectionEndpoints.get(connectionId);
      if (endpoint) {
        if (this.isAudioParam(endpoint)) {
          this.outputNode.disconnect(endpoint);
        } else {
          this.outputNode.disconnect(endpoint);
        }
        this.connectionEndpoints.delete(connectionId);
        target.releaseInputConnection(connectionId);
        return;
      }

      const tempEndpoint = target.registerInputConnection(connectionId, this);
      if (this.isAudioParam(tempEndpoint)) {
        this.outputNode.disconnect(tempEndpoint);
      } else {
        this.outputNode.disconnect(tempEndpoint);
      }
      target.releaseInputConnection(connectionId);
      return;
    }

    this.connectionEndpoints.forEach((endpoint) => {
      if (this.isAudioParam(endpoint)) {
        this.outputNode.disconnect(endpoint);
      } else {
        this.outputNode.disconnect(endpoint);
      }
    });
    this.connectionEndpoints.clear();
  }

  registerInputConnection(_connectionId: string, _fromBlock: AudioBlock, _targetIndex?: number): ConnectionEndpoint {
    return this.inputNode;
  }

  releaseInputConnection(_connectionId: string): void {
    // для большинства блоков ничего делать не нужно
  }

  destroy() {
    this.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }

  getInputNode(): GainNode {
    return this.inputNode;
  }

  getOutputNode(): GainNode {
    return this.outputNode;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.outputNode.gain.setValueAtTime(muted ? 0 : 1, this.audioContext.currentTime);
  }

  isMuted(): boolean {
    return this.muted;
  }

  protected isAudioParam(endpoint: ConnectionEndpoint): endpoint is AudioParam {
    return typeof (endpoint as AudioParam).setValueAtTime === "function";
  }
}
