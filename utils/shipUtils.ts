import { shipConfig } from "@/src/config/shipConfig";
import { Research } from "@/src/types/researchTypes";
import { Resources } from "@/src/types/resourceTypes";
import { ShipType } from "@/src/types/shipType";

export const isUnlocked = (type: string, playerResearch: Research[] = []): boolean => {
  const config = shipConfig[type as ShipType];
  if (!config) return false;

  const requiredResearch = config.requiredResearch;

  if (!requiredResearch || requiredResearch.length === 0) return true;

  return requiredResearch.every((req) => {
    const found = playerResearch.find((r) => r.data.type === req.researchType);
    return found !== undefined && found.data.level >= req.researchLevelRequired;
  });
};

export const getTotalShipCost = (type: ShipType, amount: number): Resources => {
  const config = shipConfig[type];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = baseValue * amount;
  }

  return result;
};

export const getFlyTime = (speed: number, distance: number) => {
  return Math.round(distance / (speed / 10)) * 10000;
};
