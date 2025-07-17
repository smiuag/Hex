import { ImageSourcePropType } from "react-native";
import { BuildingType } from "../types/buildingTypes";
import { IMAGES } from "../types/imageTypes";
import { Resources } from "../types/resourceTypes";

export const buildingConfig: Record<
  BuildingType,
  {
    name: string;
    baseBuildTime: number;
    image: ImageSourcePropType;
    underConstructionImage: ImageSourcePropType;
    baseCost: Partial<Resources>;
    production: Partial<Resources>;
  }
> = {
  base: {
    name: "Base",
    baseBuildTime: 1000,
    image: IMAGES.MAIN_BASE,
    underConstructionImage: IMAGES.MAIN_BASE,
    baseCost: { metal: 10000, energy: 500 },
    production: { metal: 3000, energy: 100, crystal: 200, stone: 3000 },
  },
  lab: {
    name: "Laboratorio",
    baseBuildTime: 45000,
    image: IMAGES.LAB,
    underConstructionImage: IMAGES.UNDER_CONSTRUCTION,
    baseCost: { stone: 600, metal: 600, energy: 50 },
    production: {},
  },
  metallurgie: {
    name: "Metalurgia",
    baseBuildTime: 60000,
    image: IMAGES.FACTORY,
    underConstructionImage: IMAGES.UNDER_CONSTRUCTION,
    baseCost: { metal: 1000, energy: 50 },
    production: { metal: 15 },
  },
  steinbruch: {
    name: "Cantera",
    baseBuildTime: 45000,
    image: IMAGES.LAB,
    underConstructionImage: IMAGES.UNDER_CONSTRUCTION,
    baseCost: { stone: 600, metal: 600, energy: 50 },
    production: { stone: 7 },
  },
  kristallmine: {
    name: "Laboratorio",
    baseBuildTime: 45000,
    image: IMAGES.LAB,
    underConstructionImage: IMAGES.UNDER_CONSTRUCTION,
    baseCost: { metal: 1000, energy: 50 },
    production: { crystal: 3 },
  },
};
