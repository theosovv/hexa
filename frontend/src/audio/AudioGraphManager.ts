import type { AudioBlock } from "./AudioBlock";
import { DelayBlock } from "./blocks/DelayBlock";
import { FilterBlock } from "./blocks/FilterBlock";
import { LFOBlock } from "./blocks/LFOBlock";
import { MasterOutBlock } from "./blocks/MasterOutBlock";
import { MixerBlock } from "./blocks/MixerBlock";
import { OscillatorBlock } from "./blocks/OscillatorBlock";
import { ReverbBlock } from "./blocks/ReverbBlock";
import { SamplerBlock } from "./blocks/SamplerBlock";
import { SequencerBlock, type SequencerStep } from "./blocks/SequencerBlock";
import type { AudioBlockType } from "./types";

export class AudioGraphManager {
  public blocks = new Map<string, AudioBlock>();
  private connections = new Map<string, { from: string; to: string }>();

  createBlock(id: string, type: AudioBlockType, params = {}): AudioBlock | null {
    let block: AudioBlock | null = null;

    switch (type) {
      case "oscillator":
        block = new OscillatorBlock(id, params);
        break;
      case "lfo":
        block = new LFOBlock(id, params);
        break;
      case "mixer":
        block = new MixerBlock(id, params);
        break;
      case "filter":
        block = new FilterBlock(id, params);
        break;
      case "delay":
        block = new DelayBlock(id, params);
        break;
      case "reverb":
        block = new ReverbBlock(id, params);
        break;
      case "sampler":
        block = new SamplerBlock(id, params);
        break;
      case "sequencer":
        block = new SequencerBlock(id, params);
        break;
      case "master":
        block = new MasterOutBlock(id, params);
        break;
      default:
        console.warn(`Unknown block type: ${type}`);
        return null;
    }

    this.blocks.set(id, block!);

    return block;
  }

  removeBlock(id: string) {
    const block = this.blocks.get(id);

    if (block) {
      this.connections.forEach((conn, connId) => {
        if (conn.from === id || conn.to === id) {
          this.disconnect(connId);
        }
      });

      block.destroy();
      this.blocks.delete(id);
    }
  }

  connect(fromId: string, toId: string, targetIndex?: number): string | null {
    const fromBlock = this.blocks.get(fromId);
    const toBlock = this.blocks.get(toId);

    if (!fromBlock || !toBlock) {
      console.warn("Cannot connect: block not found");

      return null;
    }

    const connectionId = `${fromId}-${toId}-${crypto.randomUUID()}`;

    fromBlock.connect(toBlock, connectionId, targetIndex);
    this.connections.set(connectionId, { from: fromId, to: toId });

    if (fromBlock instanceof SequencerBlock) {
      fromBlock.connectTarget(connectionId, toBlock);
    }

    return connectionId;
  }

  disconnect(connectionId: string) {
    const conn = this.connections.get(connectionId);

    if (!conn) return;

    const fromBlock = this.blocks.get(conn.from);
    const toBlock = this.blocks.get(conn.to);

    if (fromBlock && toBlock) {
      fromBlock.disconnect(toBlock, connectionId);

      if (fromBlock instanceof SequencerBlock) {
        fromBlock.disconnectTarget(connectionId);
      }
    }

    this.connections.delete(connectionId);
  }

  getBlock(id: string): AudioBlock | undefined {
    return this.blocks.get(id);
  }

  updateBlockParam(id: string, key: string, value: number | string | boolean | SequencerStep[]) {
    const block = this.blocks.get(id);

    if (block) {
      block.updateParam(key, value);
    }
  }

  clear() {
    this.blocks.forEach((block) => block.destroy());
    this.blocks.clear();
    this.connections.clear();
  }
}
