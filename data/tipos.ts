export type TerrainType =
  | "forest"
  | "desert"
  | "water"
  | "mountain"
  | "base"
  | "ice"
  | "lava"
  | "swamp"
  | "plains";

export type BuildingType = "base" | "factory" | "lab";

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type Hex = {
  q: number;
  r: number;
  terrain: TerrainType;
  building?: BuildingData | null;
  previousBuilding?: BuildingData | null;
  construction?: {
    building: BuildingType;
    startedAt: number;
    targetLevel: number;
  };
};
