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
export type ResourceType = "metal" | "crystal" | "energy" | "stone";

export type Resources = {
  [key in ResourceType]: number;
};

export const ResourceEmojis: Record<ResourceType, string> = {
  metal: "🔩", // tornillo
  stone: "🪨", // roca
  energy: "⚡", // rayo
  crystal: "💎", // diamante
};

export type StoredResources = {
  resources: Resources;
  lastUpdate: number;
};

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type Hex = {
  q: number;
  r: number;
  isVisible: boolean;
  terrain: TerrainType;
  building?: BuildingData | null;
  previousBuilding?: BuildingData | null;
  construction?: {
    building: BuildingType;
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};

export const buildingConfig: Record<
  BuildingType,
  {
    name: string;
    baseBuildTime: number;
    image: number;
    underConstructionImage: number;
    baseCost: Partial<Resources>;
    production: Partial<Resources>;
  }
> = {
  base: {
    name: "Base",
    baseBuildTime: 30000,
    image: require("../assets/images/mini/MainBase.png"),
    underConstructionImage: require("../assets/images/mini/MainBase.png"),
    baseCost: { metal: 10000, energy: 500 },
    production: { metal: 3, energy: 1, crystal: 2 },
  },
  factory: {
    name: "Fábrica",
    baseBuildTime: 60000,
    image: require("../assets/images/mini/Factory.png"),
    underConstructionImage: require("../assets/images/mini/UnderConstruction.png"),
    baseCost: { metal: 1000, energy: 50 },
    production: { metal: 7 },
  },
  lab: {
    name: "Laboratorio",
    baseBuildTime: 45000,
    image: require("../assets/images/mini/Lab.png"),
    underConstructionImage: require("../assets/images/mini/UnderConstruction.png"),
    baseCost: { metal: 1000, energy: 50 },
    production: {},
  },
};
