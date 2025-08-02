export type TerrainType = "water" | "base" | "initial" | "border";

export type TerrainData = {
  image?: number;
  fallbackColor: string;
  label?: string;
};
