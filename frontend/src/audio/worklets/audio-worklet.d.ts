export {};

declare global {
  const sampleRate: number;
  const currentFrame: number;
  abstract class AudioWorkletProcessor {
    readonly port: MessagePort;
    constructor();
    process(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      parameters: Record<string, Float32Array>,
    ): boolean;
  }

  type AudioWorkletProcessorConstructor = new () => AudioWorkletProcessor;

  function registerProcessor(
    name: string,
    processorCtor: AudioWorkletProcessorConstructor,
  ): void;
}
