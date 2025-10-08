import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParams } from "../types";

export class SamplerBlock extends AudioBlock {
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private velocityGain: GainNode;
  private isLooping = false;
  private triggeredMode = false;

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "sampler", {
      gain: 0.8,
      playbackRate: 1.0,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      sampleUrl: "",
      ...params,
    });

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.params.gain as number;

    this.velocityGain = this.audioContext.createGain();
    this.velocityGain.gain.value = 1;

    this.gainNode.connect(this.velocityGain);
    this.velocityGain.connect(this.outputNode);

    this.inputNode.connect(this.gainNode);

    this.isLooping = this.params.loop as boolean;
  }

  initialize() {
    // Sampler starts inactive
  }

  setTriggeredMode(enabled: boolean) {
    this.triggeredMode = enabled;

    if (!enabled) {
      this.velocityGain.gain.setValueAtTime(1, this.audioContext.currentTime);
    }
  }

  async loadSample(url: string) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);

      if (this.params.loopEnd === 0 && this.buffer) {
        this.params.loopEnd = this.buffer.duration;
      }

      console.log(`✓ Sample loaded: ${this.buffer.duration.toFixed(2)}s`);
      this.params.sampleUrl = url;
    } catch (error) {
      console.error("Failed to load sample:", error);
      throw error;
    }
  }

  play(when = 0, offset = 0, velocity = 1) {
    if (!this.buffer) {
      console.warn("No sample loaded");
      return;
    }

    this.stop();

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.playbackRate.value = this.params.playbackRate as number;
    this.source.loop = this.isLooping;

    if (this.isLooping) {
      this.source.loopStart = this.params.loopStart as number;
      this.source.loopEnd = this.params.loopEnd as number;
    }

    this.source.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    const target = this.triggeredMode ? velocity : 1;
    this.velocityGain.gain.cancelScheduledValues(now);
    this.velocityGain.gain.setValueAtTime(target, now);

    if (!this.isLooping) {
      this.source.onended = () => {
        if (this.source) {
          this.source.disconnect();
          this.source = null;
        }
        if (this.triggeredMode) {
          this.velocityGain.gain.setValueAtTime(1, this.audioContext.currentTime);
        }
      };
    }

    this.source.start(this.audioContext.currentTime + when, offset);
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // Already stopped
      }
      this.source.disconnect();
      this.source = null;
    }
  }

  trigger(options?: { velocity?: number }) {
    const velocity = this.triggeredMode
      ? Math.max(0, Math.min(1, options?.velocity ?? 1))
      : 1;

    this.play(0, 0, velocity);
  }

  receiveTrigger(payload: { step: number; velocity: number }) {
    this.trigger({ velocity: payload.velocity });
  }

  isPlaying(): boolean {
    return this.source !== null;
  }

  getDuration(): number {
    return this.buffer?.duration || 0;
  }

  updateParam(key: string, value: number | string | boolean) {
    this.params[key] = value;

    switch (key) {
      case "gain":
        this.gainNode.gain.setValueAtTime(
          value as number,
          this.audioContext.currentTime,
        );
        break;
      case "playbackRate":
        if (this.source) {
          this.source.playbackRate.setValueAtTime(
            value as number,
            this.audioContext.currentTime,
          );
        }
        break;
      case "loop":
        this.isLooping = value as boolean;
        if (this.source) {
          this.source.loop = this.isLooping;
        }
        break;
      case "loopStart":
        if (this.source && this.isLooping) {
          this.source.loopStart = value as number;
        }
        break;
      case "loopEnd":
        if (this.source && this.isLooping) {
          this.source.loopEnd = value as number;
        }
        break;
    }
  }

  destroy() {
    this.stop();
    this.gainNode.disconnect();
    super.destroy();
  }
}
