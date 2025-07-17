export type BuildingType =
  | "base"
  | "metallurgie"
  | "lab"
  | "steinbruch"
  | "kristallmine";

export type BuildingData = {
  type: BuildingType;
  level: number;
};
