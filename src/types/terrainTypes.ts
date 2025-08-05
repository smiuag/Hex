export type TerrainType = "WATER" | "BASE" | "INITIAL" | "BORDER" | "ANCIENT_ALIEN_STRUCTURES";

export type TerrainData = {
  image?: number;
  fallbackColor: string;
  label?: string;
};
