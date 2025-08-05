import { buildingConfig } from "@/src/config/buildingConfig";
import { resourceEmojis } from "@/src/config/emojisConfig";
import { PRODUCTION_INCREMENT } from "@/src/constants/general";
import { Hex } from "@/src/types/hexTypes";
import { CombinedResourcesType, Resources, StoredResources } from "@/src/types/resourceTypes";

export const getProductionForBuilding = (
  type: keyof typeof buildingConfig,
  level: number
): Partial<Resources> => {
  const config = buildingConfig[type];
  const baseProduction = config?.production;

  const result: Partial<Resources> = {};

  if (!baseProduction) return result;

  for (const key in baseProduction) {
    const resource = key as keyof Resources;
    const baseValue = baseProduction[resource] ?? 0;
    const scaled = baseValue * Math.pow(PRODUCTION_INCREMENT, Math.max(0, level - 1));
    result[resource] = scaled;
  }

  return result;
};

export const getProduction = (hexes: Hex[]): Partial<Resources> => {
  const result: Partial<Resources> = {};

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const production = getProductionForBuilding(building.type, building.level);
      for (const key in production) {
        const typedKey = key as keyof Resources;
        result[typedKey] = (result[typedKey] || 0) + (production[typedKey] || 0); // Si no hay producción, usamos 0
      }
    }
  }

  return result;
};

export const hasEnoughResources = (current: StoredResources, cost: Partial<Resources>): boolean => {
  const produced: Partial<Resources> = current.production || {};
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
