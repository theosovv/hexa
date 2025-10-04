export class AudioContextManager {
  private static instance: AudioContextManager;
  private context: AudioContext | null = null;

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }

    return AudioContextManager.instance;
  }

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      this.context.resume();
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
