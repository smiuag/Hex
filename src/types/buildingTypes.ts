export type BuildingType =
  | "BASE"
  | "METALLURGY"
  | "LAB"
  | "QUARRY"
  | "KRYSTALMINE"
  | "HANGAR"
  | "ANTENNA"
  | "ROCKET"
  | "ENERGY"
  | "SPACESTATION"
  | "RECYCLE"
  | "RESIDUE"
  | "GREENHOUSE"
  | "WATEREXTRACTOR"
  | "ALIEN_LAB"
  | "EMBASSY";

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type BuildingRequiredData = {
  buildingType: BuildingType;
  buildingLevelRequired: number;
  researchLevel: number;
};

export type ResearchRequiredBuilding = BuildingRequiredData[];
