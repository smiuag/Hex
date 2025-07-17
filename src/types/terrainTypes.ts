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

export type TerrainConfig = {
  image?: number;
  fallbackColor: string;
  label?: string;
};
