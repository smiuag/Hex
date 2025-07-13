import { buildingConfig } from "../data/buildings";
import { BuildingType, Resources } from "../data/tipos";

export function getBuildTime(building: BuildingType, level: number) {
  const baseTime = buildingConfig[building].baseBuildTime;
  return Math.round(baseTime * Math.pow(1.5, level - 1));
}

export function getCost(building: BuildingType, level: number): Resources {
  const config = buildingConfig[building];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  const multiplierPerLevel = 1.5;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = Math.ceil(
      baseValue * Math.pow(multiplierPerLevel, level - 1)
    );
  }

  return result;
}
