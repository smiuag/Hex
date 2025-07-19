import { ImageSourcePropType } from "react-native";

export type BuildingType =
  | "BASE"
  | "METALLURGY"
  | "LAB"
  | "QUARRY"
  | "KRYSTALMINE";

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type BuildingImageLevel = {
  level: number;
  image: ImageSourcePropType;
};
