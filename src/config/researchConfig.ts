import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import {
  MAX_LVL,
  RESEARCH_COST,
  RESEARCH_REQUIRED_BUILDING,
  RESEARCH_TIME,
} from "../constants/research";
import { BuildingType, ResearchRequiredBuilding } from "../types/buildingTypes";
import { ResearchType } from "../types/researchTypes";
import { CombinedResources } from "../types/resourceTypes";

export const researchConfig: Record<
  ResearchType,
  {
    image: ImageSourcePropType;
    maxLevel: number;
    baseCost: Partial<CombinedResources>;
    baseResearchTime: number;
    requiredBuilding: ResearchRequiredBuilding;
    order: number;
    labNeeded: BuildingType;
    needsDiscover: boolean;
  }
> = {
  MINING: {
    image: IMAGES.RESEARCH_MINING,
    baseCost: RESEARCH_COST.MINING,
    baseResearchTime: RESEARCH_TIME.MINING,
    maxLevel: MAX_LVL.MINING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.MINING,
    order: 1,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  TERRAFORMING: {
    image: IMAGES.RESEARCH_TERRAFORMING,
    baseCost: RESEARCH_COST.TERRAFORMING,
    baseResearchTime: RESEARCH_TIME.TERRAFORMING,
    maxLevel: MAX_LVL.TERRAFORMING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.TERRAFORMING,
    order: 2,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  WATERPURIFICATION: {
    image: IMAGES.RESEARCH_WATER,
    baseCost: RESEARCH_COST.WATERPURIFICATION,
    baseResearchTime: RESEARCH_TIME.WATERPURIFICATION,
    maxLevel: MAX_LVL.WATERPURIFICATION,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.WATERPURIFICATION,
    order: 3,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  FUELREFINEMENT: {
    image: IMAGES.RESEARCH_FUEL,
    baseCost: RESEARCH_COST.FUELREFINEMENT,
    baseResearchTime: RESEARCH_TIME.FUELREFINEMENT,
    maxLevel: MAX_LVL.FUELREFINEMENT,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.FUELREFINEMENT,
    order: 4,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  ENERGYEFFICIENCY: {
    image: IMAGES.RESEARCH_ENERGY,
    baseCost: RESEARCH_COST.ENERGYEFFICIENCY,
    baseResearchTime: RESEARCH_TIME.ENERGYEFFICIENCY,
    maxLevel: MAX_LVL.ENERGYEFFICIENCY,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.ENERGYEFFICIENCY,
    order: 5,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  SHIPENGINEERING: {
    image: IMAGES.RESEARCH_SHIPS,
    baseCost: RESEARCH_COST.SHIPENGINEERING,
    baseResearchTime: RESEARCH_TIME.SHIPENGINEERING,
    maxLevel: MAX_LVL.SHIPENGINEERING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.SHIPENGINEERING,
    order: 6,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  PLASMA: {
    image: IMAGES.RESEARCH_PLASMA,
    baseCost: RESEARCH_COST.PLASMA,
    baseResearchTime: RESEARCH_TIME.PLASMA,
    maxLevel: MAX_LVL.PLASMA,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.PLASMA,
    order: 7,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  LASER: {
    image: IMAGES.RESEARCH_LASER,
    baseCost: RESEARCH_COST.LASER,
    baseResearchTime: RESEARCH_TIME.LASER,
    maxLevel: MAX_LVL.LASER,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.LASER,
    order: 8,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  SHIELD: {
    image: IMAGES.RESEARCH_SHIELD,
    baseCost: RESEARCH_COST.SHIELD,
    baseResearchTime: RESEARCH_TIME.SHIELD,
    maxLevel: MAX_LVL.SHIELD,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.SHIELD,
    order: 9,
    labNeeded: "LAB",
    needsDiscover: false,
  },
  GRAVITY: {
    image: IMAGES.RESEARCH_GRAVITY,
    baseCost: RESEARCH_COST.GRAVITY,
    baseResearchTime: RESEARCH_TIME.GRAVITY,
    maxLevel: MAX_LVL.GRAVITY,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.GRAVITY,
    order: 10,
    labNeeded: "ALIEN_LAB",
    needsDiscover: false,
  },
  ONTOCUANTICA: {
    image: IMAGES.RESEARCH_ONTOCUANTICA,
    baseCost: RESEARCH_COST.ONTOCUANTICA,
    baseResearchTime: RESEARCH_TIME.ONTOCUANTICA,
    maxLevel: MAX_LVL.ONTOCUANTICA,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.ONTOCUANTICA,
    order: 11,
    labNeeded: "ALIEN_LAB",
    needsDiscover: true,
  },
  KELSIANO: {
    image: IMAGES.RESEARCH_KELSIANO,
    baseCost: RESEARCH_COST.KELSIANO,
    baseResearchTime: RESEARCH_TIME.KELSIANO,
    maxLevel: MAX_LVL.KELSIANO,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.KELSIANO,
    order: 12,
    labNeeded: "ALIEN_LAB",
    needsDiscover: true,
  },
  HEXOXIDO: {
    image: IMAGES.RESEARCH_HEXOXIDO,
    baseCost: RESEARCH_COST.HEXOXIDO,
    baseResearchTime: RESEARCH_TIME.HEXOXIDO,
    maxLevel: MAX_LVL.HEXOXIDO,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.HEXOXIDO,
    order: 13,
    labNeeded: "ALIEN_LAB",
    needsDiscover: true,
  },
  SELENOGRAFIA: {
    image: IMAGES.RESEARCH_SELENOGRAFIA,
    baseCost: RESEARCH_COST.SELENOGRAFIA,
    baseResearchTime: RESEARCH_TIME.SELENOGRAFIA,
    maxLevel: MAX_LVL.SELENOGRAFIA,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.SELENOGRAFIA,
    order: 14,
    labNeeded: "ALIEN_LAB",
    needsDiscover: true,
  },
  FLUXION: {
    image: IMAGES.RESEARCH_FLUXION,
    baseCost: RESEARCH_COST.FLUXION,
    baseResearchTime: RESEARCH_TIME.FLUXION,
    maxLevel: MAX_LVL.FLUXION,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.FLUXION,
    order: 15,
    labNeeded: "ALIEN_LAB",
    needsDiscover: true,
  },
};
