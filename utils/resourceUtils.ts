import { Hex, Resources, StoredResources, buildingConfig } from "../data/tipos";

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

export function getProduction(hexes: Hex[]): Partial<Resources> {
  const result: Partial<Resources> = { metal: 0, energy: 0, crystal: 0 };

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const config = buildingConfig[building.type];
      if (config.production) {
        for (const key in config.production) {
          const typedKey = key as keyof Resources;
          const perLevel = config.production[typedKey] ?? 0;
          if (result[typedKey]) result[typedKey] += perLevel * building.level;
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

export function hasEnoughResources(
  current: Resources,
  cost: Partial<Resources>
): boolean {
  return Object.entries(cost).every(([key, value]) => {
    const typedKey = key as keyof Resources;
    return (current[typedKey] ?? 0) >= (value ?? 0);
  });
}

export function applyResourceChange(
  base: Resources,
  change: Partial<Resources>,
  multiplier = 1
): Resources {
  const updated: Resources = { ...base };
  for (const key in change) {
    const typedKey = key as keyof Resources;
    updated[typedKey] = Math.max(
      0,
      updated[typedKey] + (change[typedKey] ?? 0) * multiplier
    );
  }
  return updated;
}

export const getFormatedValue = (value: number): string => {
  const format = (val: number, suffix: string): string => {
    const truncated = Math.floor(val * 10) / 10;
    return (
      (truncated % 1 === 0 ? truncated.toFixed(0) : truncated.toFixed(1)) +
      suffix
    );
  };

  if (value >= 1_000_000_000) {
    return format(value / 1_000_000_000, "B");
  }
  if (value >= 1_000_000) {
    return format(value / 1_000_000, "M");
  }
  if (value >= 1_000) {
    return format(value / 1_000, "K");
  }
  return value.toString();
};
