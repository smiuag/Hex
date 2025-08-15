import { buildingConfig } from "@/src/config/buildingConfig";
import { resourceEmojis } from "@/src/config/emojisConfig";
import { PRODUCTION_INCREMENT } from "@/src/constants/general";
import { Hex } from "@/src/types/hexTypes";
import {
  CombinedResources,
  CombinedResourcesType,
  Resources,
  SPECIAL_TYPES,
  StoredResources,
} from "@/src/types/resourceTypes";

export const getProductionForBuilding = (
  type: keyof typeof buildingConfig,
  level: number
): Partial<CombinedResources> => {
  const config = buildingConfig[type];
  const baseProduction = config?.production;

  const result: Partial<CombinedResources> = {};

  if (!baseProduction) return result;

  for (const key in baseProduction) {
    const resource = key as keyof CombinedResources;
    const baseValue = baseProduction[resource] ?? 0;
    const scaled = baseValue * Math.pow(PRODUCTION_INCREMENT, Math.max(0, level - 1));
    result[resource] = scaled;
  }

  return result;
};

export const getProduction = (hexes: Hex[]): Partial<CombinedResources> => {
  const result: Partial<CombinedResources> = {};

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const production = getProductionForBuilding(building.type, building.level);
      for (const key in production) {
        const typedKey = key as keyof CombinedResources;
        result[typedKey] = (result[typedKey] || 0) + (production[typedKey] || 0); // Si no hay producción, usamos 0
      }
    }
  }

  return result;
};

export const hasEnoughResources = (
  current: StoredResources,
  cost: Partial<CombinedResources>
): boolean => {
  const produced: Partial<CombinedResources> = current.production || {};
  const elapsedSeconds = (Date.now() - current.lastUpdate) / 1000;

  return Object.entries(cost).every(([key, value]) => {
    const typedKey = key as keyof Resources;
    const availableResources =
      (current.resources[typedKey] || 0) + (produced[typedKey] || 0) * elapsedSeconds;

    return availableResources >= (value || 0);
  });
};

export const generateRandomResources = (): Partial<Resources> => {
  const roll = () => (Math.random() < 0.4 ? Math.floor(Math.random() * 500 + 50) : 0);

  return {
    METAL: roll(),
    CRYSTAL: roll(),
    STONE: roll(),
  };
};

export const isCombinedResourcesType = (key: string): key is CombinedResourcesType => {
  return key in resourceEmojis;
};

export const sumCombinedResources = (
  a: CombinedResources,
  b: CombinedResources
): CombinedResources => {
  const result: CombinedResources = { ...a };

  (Object.keys(b) as CombinedResourcesType[]).forEach((key) => {
    const valueA = result[key] ?? 0;
    const valueB = (b[key] ?? 0) / 60;
    result[key] = valueA + valueB;
  });

  return result;
};

export const isSpecialResourceType = (key: string): key is (typeof SPECIAL_TYPES)[number] =>
  SPECIAL_TYPES.includes(key as (typeof SPECIAL_TYPES)[number]);

// Implementación
export function getAccumulatedResources(
  stored: StoredResources,
  until?: number
): { resources: Partial<CombinedResources>; delta: Partial<CombinedResources> } {
  const now = Date.now();
  const target = Math.min(until ?? now, now);
  const start = stored.lastUpdate ?? target;

  const elapsedMs = Math.max(0, target - start);
  const base: Partial<CombinedResources> = { ...stored.resources };

  if (elapsedMs === 0) {
    return { resources: base, delta: {} };
  }

  const elapsedSeconds = elapsedMs / 1000;
  const updated: Partial<CombinedResources> = { ...base };

  const prod = (stored.production ?? {}) as Partial<CombinedResources>;
  for (const key in prod) {
    const k = key as keyof CombinedResources;
    const rate = prod[k] || 0;
    if (!rate) continue;
    updated[k] = (updated[k] ?? 0) + rate * elapsedSeconds;
  }

  const delta: Partial<CombinedResources> = {};
  const keys = new Set([...Object.keys(updated), ...Object.keys(base)]);
  for (const k of keys) {
    const key = k as keyof CombinedResources;
    const before = base[key] || 0;
    const after = updated[key] || 0;
    const d = after - before;
    if (d !== 0) delta[key] = d;
  }
  return { resources: updated, delta };
}
