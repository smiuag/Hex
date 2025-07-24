import { researchTechnologies } from "../src/config/researchConfig";
import {
  GENERAL_FACTOR,
  RESEARCH_COST_INCREMENT,
  RESEARCH_TIME_INCREMENT,
} from "../src/constants/general";
import { Hex } from "../src/types/hexTypes";
import { ResearchType } from "../src/types/researchTypes";
import { Resources } from "../src/types/resourceTypes";

export const getResearchTime = (
  research: ResearchType,
  level: number
): number => {
  const baseTime = researchTechnologies[research].baseResearchTime;
  return Math.round(
    (baseTime / GENERAL_FACTOR) * Math.pow(RESEARCH_TIME_INCREMENT, level - 1)
  );
};

export const getLabLevel = (hexes: Hex[]): number => {
  const labHex = hexes.find((hex) => hex.building?.type === "LAB");
  return labHex?.building?.level ?? 0;
};

export const getResearchCost = (
  type: ResearchType,
  level: number
): Resources => {
  const config = researchTechnologies[type];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = Math.ceil(
      baseValue * Math.pow(RESEARCH_COST_INCREMENT, level - 1)
    );
  }

  return result;
};
