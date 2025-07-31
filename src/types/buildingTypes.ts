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
  | "RESIDUE";

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
