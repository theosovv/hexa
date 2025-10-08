export type AudioBlockParamPrimitive = number | string | boolean;

export interface AudioBlockParams {
  [key: string]:
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
  | "master";
