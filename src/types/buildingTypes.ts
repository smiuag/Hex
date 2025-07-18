import { ImageSourcePropType } from "react-native";

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

type BuildingImageLevel = {
  level: number;
  image: ImageSourcePropType;
};
