import { shipConfig } from "@/src/config/shipConfig";
import { GENERAL_FACTOR } from "@/src/constants/general";
import { Research, ShipRequiredResearch } from "@/src/types/researchTypes";
import { Resources } from "@/src/types/resourceTypes";
import { Ship, ShipData, ShipType } from "@/src/types/shipType";

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
    result[resource] = (baseValue * amount) / GENERAL_FACTOR;
  }

  return result;
};

export const getFlyTime = (speed: number, distance: number) => {
  return (Math.round(distance / (speed / 10)) * 10000) / GENERAL_FACTOR;
};

export const getUnmetRequirements = (
  requiredResearch: ShipRequiredResearch,
  research: Research[]
) => {
  return (
    requiredResearch.filter((req) => {
      const playerResearchLevel =
        research.find((r) => r.data.type === req.researchType)?.data.level ?? 0;
      return playerResearchLevel < req.researchLevelRequired;
    }) ?? []
  );
};

export const getRandomShipAttackFleet = (shipBuildQueue: Ship[]): Ship[] => {
  const ships: Ship[] = [];
  shipBuildQueue.forEach((s) => {
    const amount = Math.ceil(Math.random() * 2 * s.amount);
    if (amount > 0 && s.type != "PROBE" && s.type != "FREIGHTER")
      ships.push({ type: s.type, amount: amount });
  });

  if (ships.length == 0) ships.push({ type: "ESCORTFRIGATE", amount: 3 });
  return ships;
};

export const getShips = (shipData: ShipData[]): Ship[] => {
  const ships: Ship[] = [];
  shipData.forEach((s) => {
    ships.push({ type: s.type, amount: s.amount });
  });
  return ships;
};

export const totalShips = (ships: Array<{ type: any; amount: number }>) =>
  ships.reduce((s, sh) => s + (sh.amount || 0), 0);

export function sumShipArray(arr: ShipData[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of arr) map[s.type] = (map[s.type] ?? 0) + s.amount;
  return map;
}
