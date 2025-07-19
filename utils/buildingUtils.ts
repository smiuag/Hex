import { buildingConfig } from "../src/config/buildingConfig";
import {
  BUILD_COST_INCREMENT,
  BUILD_TIME_INCREMENT,
  GENERAL_FACTOR,
} from "../src/constants/general";
import { BuildingType } from "../src/types/buildingTypes";
import { Research } from "../src/types/researchTypes";
import { Resources } from "../src/types/resourceTypes";

export function getBuildTime(building: BuildingType, level: number) {
  const baseTime = buildingConfig[building].baseBuildTime;
  return Math.round(
    (baseTime * Math.pow(BUILD_TIME_INCREMENT, level - 1)) / GENERAL_FACTOR
  );
}

export function getBuildCost(building: BuildingType, level: number): Resources {
  const config = buildingConfig[building];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = Math.ceil(
      baseValue * Math.pow(BUILD_COST_INCREMENT, level - 1)
    );
  }

  return result;
}

export const getAvailableBuildings = (researches: Research[]) => {
  return (Object.keys(buildingConfig) as BuildingType[])
    .filter((type) => {
      const requirements = buildingConfig[type].requiredResearchs;

      return requirements.every((req) => {
        const researchFound = researches.find((r) => r.type.type === req.type);
        return researchFound && researchFound.type.level >= req.level;
      });
    })
    .map((type) => ({
      type,
      ...buildingConfig[type],
    }));
};
