export type TerrainType =
  | "forest"
  | "desert"
  | "water"
  | "mountain"
  | "base"
  | "ice"
  | "lava"
  | "swamp"
  | "plains"
  | "initial"
  | "border";

export type TerrainData = {
  image?: number;
  fallbackColor: string;
  label?: string;
};
