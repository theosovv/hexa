import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

type ParamsType = "size" | "decay" | "mix";

export class ReverbBlock extends AudioBlock {
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "reverb", {
      size: 2.0,
      decay: 3.0,
      mix: 0.3,
      ...params,
    });

    this.convolver = this.audioContext.createConvolver();
    this.wetGain = this.audioContext.createGain();
    this.wetGain.gain.value = this.params.mix as number;

    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = 1 - (this.params.mix as number);

    // Routing
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    this.inputNode.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    this.initialize();
  }

  initialize() {
    this.generateImpulseResponse();
  }

  private generateImpulseResponse() {
    const size = this.params.size as number;
    const decay = this.params.decay as number;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const amplitude = (Math.random() * 2 - 1) * size;
        const envelope = Math.pow(1 - i / length, decay);
        channelData[i] = amplitude * envelope;
      }
    }

    this.convolver.buffer = impulse;
  }

  updateParam(key: ParamsType, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "size":
      case "decay":
        this.generateImpulseResponse();
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
    this.convolver.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    super.destroy();
  }
}
