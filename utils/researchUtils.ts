import { researchConfig } from "@/src/config/researchConfig";
import {
  GENERAL_FACTOR,
  RESEARCH_COST_INCREMENT,
  RESEARCH_TIME_INCREMENT,
} from "@/src/constants/general";
import { BuildingRequiredData } from "@/src/types/buildingTypes";
import { Hex } from "@/src/types/hexTypes";
import { ResearchType } from "@/src/types/researchTypes";
import { Resources } from "@/src/types/resourceTypes";

export const getResearchTime = (research: ResearchType, level: number): number => {
  const baseTime = researchConfig[research].baseResearchTime;
  return Math.round(baseTime * Math.pow(RESEARCH_TIME_INCREMENT, level - 1)) / GENERAL_FACTOR;
};

export const getResearchCost = (type: ResearchType, level: number): Resources => {
  const config = researchConfig[type];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] =
      Math.ceil(baseValue * Math.pow(RESEARCH_COST_INCREMENT, level - 1)) / GENERAL_FACTOR;
  }

  return result;
};

export const isUnlocked = (type: ResearchType, level: number, hexes: Hex[] = []): boolean => {
  const config = researchConfig[type];
  if (!config) return false;

  const requiredBuilding = config.requiredBuilding;

  if (!requiredBuilding || requiredBuilding.length === 0) return true;

  const applicableRequirements = requiredBuilding.filter((req) => req.researchLevel <= level);

  return applicableRequirements.every((req) => {
    return hexesMatchesRequeriments(hexes, req);
  });
};

export const hexesMatchesRequeriments = (hexes: Hex[], req: BuildingRequiredData): boolean => {
  const built = hexes.find((r) => r.building?.type === req.buildingType);
  if (built?.building?.level) return built.building.level >= req.buildingLevelRequired;

  const underConstruction = hexes.find((hex) => hex.construction?.building === req.buildingType);

  if (underConstruction?.construction?.targetLevel)
    return underConstruction.construction.targetLevel - 1 >= req.buildingLevelRequired;

  return false;
};
