import type { SequencerStep } from "./blocks/SequencerBlock";

export type AudioBlockParamPrimitive = number | string | boolean;

export interface AudioBlockParams {
  [key: string]:
    | SequencerStep[]
    | AudioBlockParamPrimitive
    | AudioBlockParamPrimitive[]
    | Record<string, AudioBlockParamPrimitive>;
}


export type AudioBlockType =
  | "oscillator"
  | "filter"
  | "delay"
  | "reverb"
  | "sampler"
  | "mixer"
  | "sequencer"
  | "master";
