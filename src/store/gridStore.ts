import { create } from "zustand";

interface GridStore {
  activeCells: Map<string, boolean>;
  toggleCell: (q: number, r: number) => void;
  isCellActive: (q: number, r: number) => boolean;
}

const cellKey = (q: number, r: number) => `${q}:${r}`;

export const useGridStore = create<GridStore>((set, get) => ({
  activeCells: new Map(),

  toggleCell: (q: number, r: number) => {
    const key = cellKey(q, r);
    set((state) => {
      const newCells = new Map(state.activeCells);
      const isActive = newCells.get(key) || false;
      if (isActive) {
        newCells.delete(key);
      } else {
        newCells.set(key, true);
      }
      return { activeCells: newCells };
    });
  },

  isCellActive: (q: number, r: number) => {
    const key = cellKey(q, r);
    return get().activeCells.get(key) || false;
  },
}));
