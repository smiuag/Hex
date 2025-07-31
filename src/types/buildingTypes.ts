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
  | "RECYCLE";

export type BuildingData = {
  type: BuildingType;
  level: number;
};
