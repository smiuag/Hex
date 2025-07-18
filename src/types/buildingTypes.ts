import { ImageSourcePropType } from "react-native";

export type BuildingType =
  | "base"
  | "metallurgy"
  | "lab"
  | "quarry"
  | "krystalmine";

export type BuildingData = {
  type: BuildingType;
  level: number;
};

export type BuildingImageLevel = {
  level: number;
  image: ImageSourcePropType;
};
