export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = [];
  private enabled = true;

  register(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  unregister(key: string) {
    this.shortcuts = this.shortcuts.filter((s) => s.key !== key);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (!this.enabled) return;

    const shortcut = this.shortcuts.find((s) => {
      const keyMatch = s.key.toLowerCase() === e.key.toLowerCase();
      const ctrlMatch = s.ctrl === undefined || s.ctrl === (e.ctrlKey || e.metaKey);
      const shiftMatch = s.shift === undefined || s.shift === e.shiftKey;
      const altMatch = s.alt === undefined || s.alt === e.altKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }
  };

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  clear() {
    this.shortcuts = [];
  }
}
