import { fleetConfig } from "../src/config/fleetConfig";
import { FleetType } from "../src/types/fleetType";
import { Research } from "../src/types/researchTypes";
import { Resources } from "../src/types/resourceTypes";

export const isUnlocked = (
  type: string,
  playerResearch: Research[] = []
): boolean => {
  const config = fleetConfig[type as FleetType];
  if (!config) return false;

  const requiredResearch = config.requiredResearch;

  if (!requiredResearch || requiredResearch.length === 0) return true;

  return requiredResearch.every((req) => {
    const found = playerResearch.find((r) => r.data.type === req.researchType);
    return found !== undefined && found.data.level >= req.researchLevelRequired;
  });
};

export const getTotalFleetCost = (
  type: FleetType,
  amount: number
): Resources => {
  const config = fleetConfig[type];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = baseValue * amount;
  }

  return result;
};
