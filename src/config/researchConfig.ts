import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import {
  MAX_LVL,
  RESEARCH_COST,
  RESEARCH_REQUIRED_BUILDING,
  RESEARCH_TIME,
} from "../constants/research";
import { ResearchRequiredBuilding } from "../types/buildingTypes";
import { ResearchType } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";

export const researchConfig: Record<
  ResearchType,
  {
    image: ImageSourcePropType;
    maxLevel: number;
    baseCost: Partial<Resources>;
    baseResearchTime: number;
    requiredBuilding: ResearchRequiredBuilding;
    order: number;
  }
> = {
  MINING: {
    image: IMAGES.RESEARCH_MINING,
    baseCost: RESEARCH_COST.MINING,
    baseResearchTime: RESEARCH_TIME.MINING,
    maxLevel: MAX_LVL.MINING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.MINING,
    order: 1,
  },
  TERRAFORMING: {
    image: IMAGES.RESEARCH_TERRAFORMING,
    baseCost: RESEARCH_COST.TERRAFORMING,
    baseResearchTime: RESEARCH_TIME.TERRAFORMING,
    maxLevel: MAX_LVL.TERRAFORMING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.TERRAFORMING,
    order: 2,
  },
  WATERPURIFICATION: {
    image: IMAGES.RESEARCH_WATER,
    baseCost: RESEARCH_COST.WATERPURIFICATION,
    baseResearchTime: RESEARCH_TIME.WATERPURIFICATION,
    maxLevel: MAX_LVL.WATERPURIFICATION,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.WATERPURIFICATION,
    order: 3,
  },
  FUELREFINEMENT: {
    image: IMAGES.RESEARCH_FUEL,
    baseCost: RESEARCH_COST.FUELREFINEMENT,
    baseResearchTime: RESEARCH_TIME.FUELREFINEMENT,
    maxLevel: MAX_LVL.FUELREFINEMENT,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.FUELREFINEMENT,
    order: 4,
  },
  ENERGYEFFICIENCY: {
    image: IMAGES.RESEARCH_ENERGY,
    baseCost: RESEARCH_COST.ENERGYEFFICIENCY,
    baseResearchTime: RESEARCH_TIME.ENERGYEFFICIENCY,
    maxLevel: MAX_LVL.ENERGYEFFICIENCY,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.ENERGYEFFICIENCY,
    order: 5,
  },
  SHIPENGINEERING: {
    image: IMAGES.RESEARCH_SHIPS,
    baseCost: RESEARCH_COST.SHIPENGINEERING,
    baseResearchTime: RESEARCH_TIME.SHIPENGINEERING,
    maxLevel: MAX_LVL.SHIPENGINEERING,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.SHIPENGINEERING,
    order: 6,
  },
  PLASMA: {
    image: IMAGES.RESEARCH_PLASMA,
    baseCost: RESEARCH_COST.PLASMA,
    baseResearchTime: RESEARCH_TIME.PLASMA,
    maxLevel: MAX_LVL.PLASMA,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.PLASMA,
    order: 7,
  },
  LASER: {
    image: IMAGES.RESEARCH_LASER,
    baseCost: RESEARCH_COST.LASER,
    baseResearchTime: RESEARCH_TIME.LASER,
    maxLevel: MAX_LVL.LASER,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.LASER,
    order: 8,
  },
  SHIELD: {
    image: IMAGES.RESEARCH_SHIELD,
    baseCost: RESEARCH_COST.SHIELD,
    baseResearchTime: RESEARCH_TIME.SHIELD,
    maxLevel: MAX_LVL.SHIELD,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.SHIELD,
    order: 9,
  },
  GRAVITY: {
    image: IMAGES.RESEARCH_GRAVITY,
    baseCost: RESEARCH_COST.GRAVITY,
    baseResearchTime: RESEARCH_TIME.GRAVITY,
    maxLevel: MAX_LVL.GRAVITY,
    requiredBuilding: RESEARCH_REQUIRED_BUILDING.GRAVITY,
    order: 10,
  },
};
