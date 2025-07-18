import { ImageSourcePropType } from "react-native";
import { BuildingImageLevel, BuildingType } from "../types/buildingTypes";
import { IMAGES } from "../types/imageTypes";
import { Resources } from "../types/resourceTypes";

export const buildingConfig: Record<
  BuildingType,
  {
    name: string;
    baseBuildTime: number;
    images: BuildingImageLevel[];
    underConstructionImage: ImageSourcePropType;
    baseCost: Partial<Resources>;
    production: Partial<Resources>;
  }
> = {
  base: {
    name: "Base",
    baseBuildTime: 1000,
    images: [
      { level: 1, image: IMAGES.BUILDING_BASE_1 },
      { level: 2, image: IMAGES.BUILDING_BASE_2 },
      { level: 3, image: IMAGES.BUILDING_BASE_3 },
      { level: 4, image: IMAGES.BUILDING_BASE_4 },
      { level: 5, image: IMAGES.BUILDING_BASE_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: { metal: 10000, energy: 500 },
    production: { metal: 3000, energy: 100, crystal: 200, stone: 3000 },
  },
  lab: {
    name: "Laboratorio",
    baseBuildTime: 45000,
    images: [
      { level: 1, image: IMAGES.BUILDING_LAB_1 },
      { level: 2, image: IMAGES.BUILDING_LAB_2 },
      { level: 3, image: IMAGES.BUILDING_LAB_3 },
      { level: 4, image: IMAGES.BUILDING_LAB_4 },
      { level: 5, image: IMAGES.BUILDING_LAB_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: { stone: 600, metal: 600, energy: 50 },
    production: {},
  },
  metallurgie: {
    name: "Metalurgia",
    baseBuildTime: 60000,
    images: [
      { level: 1, image: IMAGES.BUILDING_METAL_1 },
      { level: 2, image: IMAGES.BUILDING_METAL_2 },
      { level: 3, image: IMAGES.BUILDING_METAL_3 },
      { level: 4, image: IMAGES.BUILDING_METAL_4 },
      { level: 5, image: IMAGES.BUILDING_METAL_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: { metal: 1000, energy: 50 },
    production: { metal: 15 },
  },
  steinbruch: {
    name: "Cantera",
    baseBuildTime: 45000,
    images: [
      { level: 1, image: IMAGES.BUILDING_MINING_1 },
      { level: 2, image: IMAGES.BUILDING_MINING_2 },
      { level: 3, image: IMAGES.BUILDING_MINING_3 },
      { level: 4, image: IMAGES.BUILDING_MINING_4 },
      { level: 5, image: IMAGES.BUILDING_MINING_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: { stone: 600, metal: 600, energy: 50 },
    production: { stone: 7 },
  },
  kristallmine: {
    name: "Mina de cristal",
    baseBuildTime: 45000,
    images: [
      { level: 1, image: IMAGES.BUILDING_MINING_1 },
      { level: 2, image: IMAGES.BUILDING_MINING_2 },
      { level: 3, image: IMAGES.BUILDING_MINING_3 },
      { level: 4, image: IMAGES.BUILDING_MINING_4 },
      { level: 5, image: IMAGES.BUILDING_MINING_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: { metal: 1000, energy: 50 },
    production: { crystal: 3 },
  },
};
