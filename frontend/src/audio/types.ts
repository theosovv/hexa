export interface AudioBlockParams {
  [key: string]: number | string | boolean;
}

export type AudioBlockType =
  | "oscillator"
  | "filter"
  | "delay"
  | "reverb"
  | "master";
