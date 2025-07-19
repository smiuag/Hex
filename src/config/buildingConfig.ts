import { ImageSourcePropType } from "react-native";
import {
  BUILDING_COST,
  BUILDING_IMAGES,
  BUILDING_PRODUCTION,
  BUILDING_REQUIRED_RESEARCHS,
  BUILDING_TIME,
} from "../constants/building";
import { IMAGES } from "../constants/images";
import { BuildingImageLevel, BuildingType } from "../types/buildingTypes";
import { RequiredResearchs } from "../types/researchTypes";
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
    requiredResearchs: RequiredResearchs;
  }
> = {
  BASE: {
    name: "Base",
    baseBuildTime: BUILDING_TIME.BASE,
    images: BUILDING_IMAGES.BASE,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.BASE,
    production: BUILDING_PRODUCTION.BASE,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.BASE,
  },
  LAB: {
    name: "Laboratorio",
    baseBuildTime: BUILDING_TIME.LAB,
    images: BUILDING_IMAGES.LAB,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.LAB,
    production: BUILDING_PRODUCTION.LAB,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.LAB,
  },
  METALLURGY: {
    name: "Metalurgia",
    baseBuildTime: BUILDING_TIME.METALLURGY,
    images: BUILDING_IMAGES.METALLURGY,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.METALLURGY,
    production: BUILDING_PRODUCTION.METALLURGY,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.METALLURGY,
  },
  QUARRY: {
    name: "Cantera",
    baseBuildTime: BUILDING_TIME.QUARRY,
    images: BUILDING_IMAGES.QUARRY,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.QUARRY,
    production: BUILDING_PRODUCTION.QUARRY,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.QUARRY,
  },
  KRYSTALMINE: {
    name: "Mina de cristal",
    baseBuildTime: BUILDING_TIME.KRYSTALMINE,
    images: BUILDING_IMAGES.KRYSTALMINE,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.KRYSTALMINE,
    production: BUILDING_PRODUCTION.KRYSTALMINE,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.KRYSTALMINE,
  },
};
