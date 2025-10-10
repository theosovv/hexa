export class AudioContextManager {
  private static instance: AudioContextManager;
  private context: AudioContext | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }

    return AudioContextManager.instance;
  }

  getStreamDestination(): MediaStreamAudioDestinationNode {
    if (!this.streamDestination) {
      const context = this.getContext();
      this.streamDestination = context.createMediaStreamDestination();
    }
    return this.streamDestination;
  }

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  suspend() {
    if (this.context && this.context.state === "running") {
      this.context.suspend();
    }
  }

  resume() {
    if (this.context && this.context.state === "suspended") {
      this.context.resume();
    }
  }

  getCurrentTime(): number {
    return this.context?.currentTime || 0;
  }

  getDestination(): AudioDestinationNode | null {
    return this.context?.destination || null;
  }

  close() {
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}
