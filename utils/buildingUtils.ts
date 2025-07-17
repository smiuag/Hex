import { buildingConfig } from "../src/config/buildingConfig";
import { BuildingType } from "../src/types/buildingTypes";
import { Resources } from "../src/types/resourceTypes";

export function getBuildTime(building: BuildingType, level: number) {
  const baseTime = buildingConfig[building].baseBuildTime;
  return Math.round(baseTime * Math.pow(1.5, level - 1));
}

export function getBuildCost(building: BuildingType, level: number): Resources {
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

export const formatDuration = (timestamp: number): string => {
  let diff = Math.abs(timestamp / 1000); // diferencia en segundos

  const days = Math.floor(diff / (60 * 60 * 24));
  diff %= 60 * 60 * 24;

  const hours = Math.floor(diff / (60 * 60));
  diff %= 60 * 60;

  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

export const getAvailableBuildings = () => {
  return (Object.keys(buildingConfig) as BuildingType[]).map((type) => ({
    type,
    ...buildingConfig[type],
  }));
};
