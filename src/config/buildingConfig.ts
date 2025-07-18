import { ImageSourcePropType } from "react-native";
import {
  BUILDING_COST,
  BUILDING_IMAGES,
  BUILDING_MAX_IN_PLANET,
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
    imageBackground: ImageSourcePropType;
    underConstructionImage: ImageSourcePropType;
    baseCost: Partial<Resources>;
    production: Partial<Resources>;
    requiredResearchs: RequiredResearchs;
    description: string;
    maxNumberInPlanet: number;
  }
> = {
  BASE: {
    name: "Base",
    baseBuildTime: BUILDING_TIME.BASE,
    images: BUILDING_IMAGES.BASE,
    imageBackground: IMAGES.BASE_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.BASE,
    production: BUILDING_PRODUCTION.BASE,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.BASE,
    description: "Centro de operaciones de la colonia.",
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.BASE,
  },
  LAB: {
    name: "Laboratorio",
    baseBuildTime: BUILDING_TIME.LAB,
    images: BUILDING_IMAGES.LAB,
    imageBackground: IMAGES.LAB_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.LAB,
    production: BUILDING_PRODUCTION.LAB,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.LAB,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.LAB,
    description:
      "Centro de investigacione de la colonia. Permite hacer investigaciones para desbloquear la construcción de edificios.",
  },
  METALLURGY: {
    name: "Metalurgia",
    baseBuildTime: BUILDING_TIME.METALLURGY,
    images: BUILDING_IMAGES.METALLURGY,
    imageBackground: IMAGES.METALLURGY_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.METALLURGY,
    production: BUILDING_PRODUCTION.METALLURGY,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.METALLURGY,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.METALLURGY,
    description:
      "Instalación para la extracción de metales del subsuelo del planeta.",
  },
  QUARRY: {
    name: "Cantera",
    baseBuildTime: BUILDING_TIME.QUARRY,
    images: BUILDING_IMAGES.QUARRY,
    imageBackground: IMAGES.QUARRY_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.QUARRY,
    production: BUILDING_PRODUCTION.QUARRY,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.QUARRY,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.QUARRY,
    description:
      "Instalación para la extracción de rocas y sedimentos de la superficie del planeta.",
  },
  KRYSTALMINE: {
    name: "Mina de cristal",
    baseBuildTime: BUILDING_TIME.KRYSTALMINE,
    images: BUILDING_IMAGES.KRYSTALMINE,
    imageBackground: IMAGES.KRYSTALMINE_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.KRYSTALMINE,
    production: BUILDING_PRODUCTION.KRYSTALMINE,
    requiredResearchs: BUILDING_REQUIRED_RESEARCHS.KRYSTALMINE,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.KRYSTALMINE,
    description:
      "Instalación para la extracción de cristal de las rocas de la superficie.",
  },
};
