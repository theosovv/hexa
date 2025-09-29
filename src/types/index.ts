export interface HexCell {
  q: number;
  r: number;
  active: boolean;
  color?: string;
  sample?: string;
}

export interface TransportState {
  playing: boolean;
  bpm: number;
  currentBeat: number;
}

export interface AudioEngineState {
  initialized: boolean;
  devices: string[];
}
