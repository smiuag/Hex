import { ImageSourcePropType } from "react-native";
import {
  BUILDING_COST,
  BUILDING_PRODUCTION,
  BUILDING_TIME,
} from "../constants/building";
import { IMAGES } from "../constants/images";
import { BuildingImageLevel, BuildingType } from "../types/buildingTypes";
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
    baseBuildTime: BUILDING_TIME.BASE,
    images: [
      { level: 1, image: IMAGES.BUILDING_BASE_1 },
      { level: 2, image: IMAGES.BUILDING_BASE_2 },
      { level: 3, image: IMAGES.BUILDING_BASE_3 },
      { level: 4, image: IMAGES.BUILDING_BASE_4 },
      { level: 5, image: IMAGES.BUILDING_BASE_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.BASE,
    production: BUILDING_PRODUCTION.BASE,
  },
  lab: {
    name: "Laboratorio",
    baseBuildTime: BUILDING_TIME.LAB,
    images: [
      { level: 1, image: IMAGES.BUILDING_LAB_1 },
      { level: 2, image: IMAGES.BUILDING_LAB_2 },
      { level: 3, image: IMAGES.BUILDING_LAB_3 },
      { level: 4, image: IMAGES.BUILDING_LAB_4 },
      { level: 5, image: IMAGES.BUILDING_LAB_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.LAB,
    production: BUILDING_PRODUCTION.LAB,
  },
  metallurgy: {
    name: "Metalurgia",
    baseBuildTime: BUILDING_TIME.METALLURGY,
    images: [
      { level: 1, image: IMAGES.BUILDING_METAL_1 },
      { level: 2, image: IMAGES.BUILDING_METAL_2 },
      { level: 3, image: IMAGES.BUILDING_METAL_3 },
      { level: 4, image: IMAGES.BUILDING_METAL_4 },
      { level: 5, image: IMAGES.BUILDING_METAL_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.METALLURGY,
    production: BUILDING_PRODUCTION.METALLURGY,
  },
  quarry: {
    name: "Cantera",
    baseBuildTime: BUILDING_TIME.QUARRY,
    images: [
      { level: 1, image: IMAGES.BUILDING_MINING_1 },
      { level: 2, image: IMAGES.BUILDING_MINING_2 },
      { level: 3, image: IMAGES.BUILDING_MINING_3 },
      { level: 4, image: IMAGES.BUILDING_MINING_4 },
      { level: 5, image: IMAGES.BUILDING_MINING_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.QUARRY,
    production: BUILDING_PRODUCTION.QUARRY,
  },
  krystalmine: {
    name: "Mina de cristal",
    baseBuildTime: BUILDING_TIME.KRYSTALMINE,
    images: [
      { level: 1, image: IMAGES.BUILDING_MINING_1 },
      { level: 2, image: IMAGES.BUILDING_MINING_2 },
      { level: 3, image: IMAGES.BUILDING_MINING_3 },
      { level: 4, image: IMAGES.BUILDING_MINING_4 },
      { level: 5, image: IMAGES.BUILDING_MINING_5 },
    ],
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.KRYSTALMINE,
    production: BUILDING_PRODUCTION.KRYSTALMINE,
  },
};
