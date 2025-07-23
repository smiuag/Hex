import { ImageSourcePropType } from "react-native";

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
  | "SPACESTATION";

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type BuildingImageLevel = {
  level: number;
  image: ImageSourcePropType;
};
