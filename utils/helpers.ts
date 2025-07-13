import { buildingConfig } from "../data/buildings";
import { BuildingType } from "../data/tipos";

export function getBuildTime(building: BuildingType, level: number) {
  const baseTime = buildingConfig[building].baseBuildTime;
  return Math.round(baseTime * Math.pow(1.5, level - 1));
}
