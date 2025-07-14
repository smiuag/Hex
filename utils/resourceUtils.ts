import { buildingConfig } from "../data/buildings";
import { Hex, Resources, StoredResources } from "../data/tipos";

export function accumulateResources(
  hexes: Hex[],
  stored: StoredResources,
  diffMs: number = 1000
): StoredResources {
  const produced: Partial<Resources> = {};

  hexes.forEach((hex) => {
    const building = hex.building;
    if (building) {
      const config = buildingConfig[building.type];
      const level = building.level;
      const production = config.production;

      if (production) {
        for (const key in production) {
          const type = key as keyof Resources;
          const perSecond = production[type]! * level;
          produced[type] = (produced[type] || 0) + perSecond;
        }
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
}

export function getProduction(hexes: Hex[]): Resources {
  const result: Resources = { metal: 0, energy: 0, crystal: 0 };

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const config = buildingConfig[building.type];
      if (config.production) {
        for (const key in config.production) {
          const typedKey = key as keyof Resources;
          const perLevel = config.production[typedKey] ?? 0;
          result[typedKey] += perLevel * building.level;
        }
      }
    }
  }

  return result;
}

export function resourcesAreEqual(a: StoredResources, b: StoredResources) {
  const ra = a.resources;
  const rb = b.resources;
  return (
    ra.metal === rb.metal &&
    ra.energy === rb.energy &&
    ra.crystal === rb.crystal
  );
}
