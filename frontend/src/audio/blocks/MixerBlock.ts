import { AudioBlock } from "../AudioBlock";
import type { AudioBlockParamPrimitive, AudioBlockParams } from "../types";

interface MixerChannelState {
  id: string;
  gainNode: GainNode;
}

const DEFAULT_CHANNEL_COUNT = 4;
const DEFAULT_CHANNEL_GAIN = 1;
const MASTER_INDEX = -1;

const MODULATION_SCALE = {
  master: 0.5,
  channel: 0.5,
};

type MixerParamKey = "channels" | "master" | `gain_${number}`;
type ModTarget = "master" | "channel";

export class MixerBlock extends AudioBlock {
  private masterGain: GainNode;
  private channels: MixerChannelState[] = [];
  private channelAssignments = new Map<string, MixerChannelState>();
  private modulationNodes = new Map<string, { gain: GainNode; target: ModTarget; channel?: MixerChannelState }>();

  constructor(id: string, params: AudioBlockParams = {}) {
    super(id, "mixer", {
      channels: DEFAULT_CHANNEL_COUNT,
      master: 1,
      ...params,
    });

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.toNumber(this.params.master as AudioBlockParamPrimitive, 1);

    this.masterGain.connect(this.outputNode);

    const channelCount = this.toInteger(this.params.channels as AudioBlockParamPrimitive, DEFAULT_CHANNEL_COUNT);
    this.ensureChannelCount(channelCount);

    this.initialize();
  }

  initialize(): void {
  }

  updateParam(key: MixerParamKey, value: AudioBlockParamPrimitive): void {
    if (key === "channels") {
      const requested = this.toInteger(value, DEFAULT_CHANNEL_COUNT);
      this.params.channels = requested;
      this.ensureChannelCount(requested);

      return;
    }

    if (key === "master") {
      const master = this.toNumber(value, 1);
      this.masterGain.gain.setValueAtTime(master, this.audioContext.currentTime);
      this.params.master = master;

      return;
    }

    if (key.startsWith("gain_")) {
      const index = Number(key.split("_")[1]);
      if (!Number.isFinite(index) || index < 0 || index >= this.channels.length) {
        return;
      }
      const gain = this.toNumber(value, DEFAULT_CHANNEL_GAIN);
      const channel = this.channels[index];
      channel.gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
      this.params[key] = gain;
    }
  }

  registerInputConnection(
    connectionId: string,
    fromBlock: AudioBlock,
    targetIndex?: number,
  ): AudioNode | AudioParam {
    if (fromBlock.type === "lfo") {
      if (typeof targetIndex !== "number" || targetIndex === MASTER_INDEX) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = MODULATION_SCALE.master;
        gainNode.connect(this.masterGain.gain);
        this.modulationNodes.set(connectionId, { gain: gainNode, target: "master" });
        return gainNode;
      }

      this.ensureChannelCount(targetIndex + 1);
      const channel = this.channels[targetIndex];
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = MODULATION_SCALE.channel;
      gainNode.connect(channel.gainNode.gain);
      this.modulationNodes.set(connectionId, { gain: gainNode, target: "channel", channel });
      return gainNode;
    }

    let channel = this.channelAssignments.get(connectionId);
    if (!channel) {
      channel = this.allocateChannel(connectionId, targetIndex);
      this.channelAssignments.set(connectionId, channel);
    }

    return channel.gainNode;
  }

  releaseInputConnection(connectionId: string): void {
    const entry = this.modulationNodes.get(connectionId);
    if (entry) {
      entry.gain.disconnect();
      this.modulationNodes.delete(connectionId);
      return;
    }

    if (this.channelAssignments.delete(connectionId)) {
      return;
    }

    super.releaseInputConnection(connectionId);
  }

  destroy(): void {
    this.channels.forEach((channel) => channel.gainNode.disconnect());
    this.masterGain.disconnect();
    this.channelAssignments.clear();
    super.destroy();
  }

  private ensureChannelCount(count: number) {
    const nextCount = Math.max(1, count);

    while (this.channels.length < nextCount) {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = DEFAULT_CHANNEL_GAIN;
      gainNode.connect(this.masterGain);

      const channelIndex = this.channels.length;
      this.params[`gain_${channelIndex}`] ??= DEFAULT_CHANNEL_GAIN;

      this.channels.push({
        id: `channel-${channelIndex}`,
        gainNode,
      });
    }

    if (this.channels.length > nextCount) {
      const removed = this.channels.splice(nextCount);
      removed.forEach((channel) => {
        channel.gainNode.disconnect();
        for (const [connectionId, assigned] of this.channelAssignments.entries()) {
          if (assigned === channel) {
            this.channelAssignments.delete(connectionId);
          }
        }
      });
    }
  }

  private allocateChannel(connectionId: string, preferredIndex?: number): MixerChannelState {
    if (typeof preferredIndex === "number" && preferredIndex >= 0) {
      this.ensureChannelCount(preferredIndex + 1);
      const channel = this.channels[preferredIndex];
      this.forceAssignChannel(connectionId, channel);

      return channel;
    }

    for (const channel of this.channels) {
      if (![...this.channelAssignments.values()].includes(channel)) {
        return channel;
      }
    }

    const currentCount = this.channels.length;
    this.ensureChannelCount(currentCount + 1);
    const channel = this.channels[this.channels.length - 1];
    this.params.channels = this.channels.length;

    return channel;
  }

  private toNumber(value: AudioBlockParamPrimitive, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }

    return fallback;
  }

  private toInteger(value: AudioBlockParamPrimitive, fallback: number): number {
    return Math.max(1, Math.round(this.toNumber(value, fallback)));
  }

  private forceAssignChannel(connectionId: string, channel: MixerChannelState) {
    for (const [connId, assigned] of this.channelAssignments.entries()) {
      if (assigned === channel) {
        this.channelAssignments.delete(connId);
        break;
      }
    }
    this.channelAssignments.set(connectionId, channel);
  }
}
