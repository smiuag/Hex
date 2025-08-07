import { Hex } from "@/src/types/hexTypes";
import { create } from "zustand";

interface ModalStore {
  hex: Hex | null;
  isConstructionVisible: boolean;
  showConstruction: (hex: Hex) => void;
  close: () => void;
}

export const useConstructionModalStore = create<ModalStore>((set) => ({
  hex: null,
  isConstructionVisible: false,
  showConstruction: (hex) => set({ hex, isConstructionVisible: true }),
  close: () => set({ hex: null, isConstructionVisible: false }),
}));
