import { Hex } from "@/src/types/hexTypes";
import { create } from "zustand";

interface TerraformModalStore {
  hex: Hex | null;
  isVisible: boolean;
  showTerraform: (hex: Hex) => void;
  close: () => void;
}

export const useTerraformModalStore = create<TerraformModalStore>((set) => ({
  hex: null,
  isVisible: false,
  showTerraform: (hex) => set({ hex, isVisible: true }),
  close: () => set({ hex: null, isVisible: false }),
}));
