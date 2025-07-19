import { buildingConfig } from "../src/config/buildingConfig";
import { GENERAL_FACTOR, PRODUCTION_INCREMENT } from "../src/constants/general";
import { Hex } from "../src/types/hexTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";

export const getProductionForBuilding = (
  type: keyof typeof buildingConfig,
  level: number
): Partial<Resources> => {
  const config = buildingConfig[type];
  const baseProduction = config.production;

  const result: Partial<Resources> = {};

  if (!baseProduction) return result;

  for (const key in baseProduction) {
    const resource = key as keyof Resources;
    const baseValue = baseProduction[resource] ?? 0;
    const scaled =
      baseValue *
      Math.pow(PRODUCTION_INCREMENT, Math.max(0, level - 1)) *
      GENERAL_FACTOR;
    result[resource] = scaled;
  }

  return result;
};

export const accumulateResources = (
  hexes: Hex[],
  stored: StoredResources,
  diffMs: number = 1000
): StoredResources => {
  const produced: Partial<Resources> = {};

  hexes.forEach((hex) => {
    const building = hex.building;
    if (building) {
      const production = getProductionForBuilding(
        building.type,
        building.level
      );
      for (const key in production) {
        const typedKey = key as keyof Resources;
        produced[typedKey] =
          (produced[typedKey] || 0) + (production[typedKey] || 0);
      }
    }
  });

  const elapsedSeconds = diffMs / 1000;

  const newResources: Resources = { ...stored.resources };
  for (const key in produced) {
    const type = key as keyof Resources;
    const total = (produced[type] || 0) * elapsedSeconds;
    newResources[type] = Math.floor(newResources[type] + total);
  }

  return {
    resources: newResources,
    lastUpdate: Date.now(),
  };
};

export const getProduction = (hexes: Hex[]): Partial<Resources> => {
  const result: Partial<Resources> = { metal: 0, energy: 0, crystal: 0 };

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const production = getProductionForBuilding(
        building.type,
        building.level
      );
      for (const key in production) {
        const typedKey = key as keyof Resources;
        result[typedKey] =
          (result[typedKey] ?? 0) + (production[typedKey] ?? 0);
      }
    }
  }

  return result;
};

export const resourcesAreEqual = (
  a: StoredResources,
  b: StoredResources
): boolean => {
  const ra = a.resources;
  const rb = b.resources;
  return (
    ra.metal === rb.metal &&
    ra.energy === rb.energy &&
    ra.crystal === rb.crystal
  );
};

export const hasEnoughResources = (
  current: Resources,
  cost: Partial<Resources>
): boolean => {
  return Object.entries(cost).every(([key, value]) => {
    const typedKey = key as keyof Resources;
    return (current[typedKey] ?? 0) >= (value ?? 0);
  });
};

export const applyResourceChange = (
  base: Resources,
  change: Partial<Resources>,
  multiplier = 1
): Resources => {
  const updated: Resources = { ...base };
  for (const key in change) {
    const typedKey = key as keyof Resources;
    updated[typedKey] = Math.max(
      0,
      updated[typedKey] + (change[typedKey] ?? 0) * multiplier
    );
  }
  return updated;
};
