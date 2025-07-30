import { ImageSourcePropType } from "react-native";
import {
  BUILDING_COST,
  BUILDING_IMAGES,
  BUILDING_MAX_IN_PLANET,
  BUILDING_MAX_LVL,
  BUILDING_PRODUCTION,
  BUILDING_REQUIRED_RESEARCH,
  BUILDING_TIME,
} from "../constants/building";
import { IMAGES } from "../constants/images";
import { BuildingImageLevel, BuildingType } from "../types/buildingTypes";
import { BuildingRequiredResearch } from "../types/researchTypes";
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
    requiredResearch: BuildingRequiredResearch;
    description: string;
    maxNumberInPlanet: number;
    maxLvl: number;
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
    requiredResearch: BUILDING_REQUIRED_RESEARCH.BASE,
    description: "Centro de operaciones de la colonia.",
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.BASE,
    maxLvl: BUILDING_MAX_LVL.BASE,
  },
  LAB: {
    name: "Laboratorio",
    baseBuildTime: BUILDING_TIME.LAB,
    images: BUILDING_IMAGES.LAB,
    imageBackground: IMAGES.LAB_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.LAB,
    production: BUILDING_PRODUCTION.LAB,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.LAB,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.LAB,
    description:
      "Centro de investigacione de la colonia. Permite hacer investigaciones para desbloquear la construcción de edificios.",
    maxLvl: BUILDING_MAX_LVL.LAB,
  },
  METALLURGY: {
    name: "Mina de metales",
    baseBuildTime: BUILDING_TIME.METALLURGY,
    images: BUILDING_IMAGES.METALLURGY,
    imageBackground: IMAGES.METALLURGY_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.METALLURGY,
    production: BUILDING_PRODUCTION.METALLURGY,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.METALLURGY,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.METALLURGY,
    description: "Instalación para la extracción de metales del subsuelo del planeta.",
    maxLvl: BUILDING_MAX_LVL.METALLURGY,
  },
  QUARRY: {
    name: "Cantera",
    baseBuildTime: BUILDING_TIME.QUARRY,
    images: BUILDING_IMAGES.QUARRY,
    imageBackground: IMAGES.QUARRY_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.QUARRY,
    production: BUILDING_PRODUCTION.QUARRY,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.QUARRY,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.QUARRY,
    description:
      "Instalación para la extracción de rocas y sedimentos de la superficie del planeta.",
    maxLvl: BUILDING_MAX_LVL.QUARRY,
  },
  KRYSTALMINE: {
    name: "Mina de cristal",
    baseBuildTime: BUILDING_TIME.KRYSTALMINE,
    images: BUILDING_IMAGES.KRYSTALMINE,
    imageBackground: IMAGES.KRYSTALMINE_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.KRYSTALMINE,
    production: BUILDING_PRODUCTION.KRYSTALMINE,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.KRYSTALMINE,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.KRYSTALMINE,
    description: "Instalación para la extracción de cristal de las rocas de la superficie.",
    maxLvl: BUILDING_MAX_LVL.KRYSTALMINE,
  },
  ANTENNA: {
    name: "Antena de comunicaciones",
    baseBuildTime: BUILDING_TIME.ANTENNA,
    images: BUILDING_IMAGES.ANTENNA,
    imageBackground: IMAGES.ANTENNA_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.ANTENNA,
    production: BUILDING_PRODUCTION.ANTENNA,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.ANTENNA,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.ANTENNA,
    description: "Antena de comunicaciones de corto alcance.",
    maxLvl: BUILDING_MAX_LVL.ANTENNA,
  },
  HANGAR: {
    name: "Hangar",
    baseBuildTime: BUILDING_TIME.HANGAR,
    images: BUILDING_IMAGES.HANGAR,
    imageBackground: IMAGES.HANGAR_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.HANGAR,
    production: BUILDING_PRODUCTION.HANGAR,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.HANGAR,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.HANGAR,
    description: "Hangar de naves de la flota del planeta.",
    maxLvl: BUILDING_MAX_LVL.HANGAR,
  },
  ROCKET: {
    name: "Lanzadera de cohetes",
    baseBuildTime: BUILDING_TIME.ROCKET,
    images: BUILDING_IMAGES.ROCKET,
    imageBackground: IMAGES.ROCKET_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.ROCKET,
    production: BUILDING_PRODUCTION.ROCKET,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.ROCKET,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.ROCKET,
    description: "Hangar y lanzadera de cohetes y naves interplanetarias.",
    maxLvl: BUILDING_MAX_LVL.ROCKET,
  },
  ENERGY: {
    name: "Central de energía",
    baseBuildTime: BUILDING_TIME.ENERGY,
    images: BUILDING_IMAGES.ENERGY,
    imageBackground: IMAGES.ENERGY_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.ENERGY,
    production: BUILDING_PRODUCTION.ENERGY,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.ENERGY,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.ENERGY,
    description: "Hangar y lanzadera de cohetes y naves interplanetarias.",
    maxLvl: BUILDING_MAX_LVL.ENERGY,
  },
  SPACESTATION: {
    name: "Estación espacial",
    baseBuildTime: BUILDING_TIME.SPACESTATION,
    images: BUILDING_IMAGES.SPACESTATION,
    imageBackground: IMAGES.SPACESTATION_BACKGROUND,
    underConstructionImage: IMAGES.BUILDING_UNDER_CONSTRUCTION,
    baseCost: BUILDING_COST.SPACESTATION,
    production: BUILDING_PRODUCTION.SPACESTATION,
    requiredResearch: BUILDING_REQUIRED_RESEARCH.SPACESTATION,
    maxNumberInPlanet: BUILDING_MAX_IN_PLANET.SPACESTATION,
    description: "Hangar y lanzadera de cohetes y naves interplanetarias.",
    maxLvl: BUILDING_MAX_LVL.SPACESTATION,
  },
};
