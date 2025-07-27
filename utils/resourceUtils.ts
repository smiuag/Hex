import { buildingConfig } from "../src/config/buildingConfig";
import { GENERAL_FACTOR, PRODUCTION_INCREMENT } from "../src/constants/general";
import { Hex } from "../src/types/hexTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
export const getProductionForBuilding = (
  type: keyof typeof buildingConfig,
  level: number
): Partial<Resources> => {
  const config = buildingConfig[type];
  const baseProduction = config?.production; // Usamos el operador de encadenamiento opcional para evitar errores si no existe producción

  const result: Partial<Resources> = {};

  if (!baseProduction) return result;

  for (const key in baseProduction) {
    const resource = key as keyof Resources;
    const baseValue = baseProduction[resource] ?? 0; // Si no hay valor, asignamos 0
    const scaled =
      baseValue * Math.pow(PRODUCTION_INCREMENT, Math.max(0, level - 1)) * GENERAL_FACTOR;
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

// export const accumulateResources = (
//   hexes: Hex[],
//   stored: StoredResources,
//   diffMs: number = 1000
// ): StoredResources => {
//   const production: Partial<Resources> = {};

//   hexes.forEach((hex) => {
//     const building = hex.building;
//     if (building) {
//       const buildingProduction = getProductionForBuilding(
//         building.type,
//         building.level
//       );
//       for (const key in buildingProduction) {
//         const typedKey = key as keyof Resources;
//         production[typedKey] =
//           (production[typedKey] || 0) + (buildingProduction[typedKey] || 0);
//       }
//     }
//   });

//   const elapsedSeconds = diffMs / 1000;

//   const newResources: Partial<Resources> = { ...stored.resources };
//   for (const key in production) {
//     const type = key as keyof Resources;
//     const total = (production[type] || 0) * elapsedSeconds;
//     newResources[type] = Math.floor(newResources[type] || 0 + total);
//   }

//   return {
//     resources: newResources,
//     lastUpdate: Date.now(),
//     production: production,
//   };
// };

// export const resourcesAreEqual = (
//   a: StoredResources,
//   b: StoredResources
// ): boolean => {
//   const ra = a.resources;
//   const rb = b.resources;
//   return (
//     ra.metal === rb.metal &&
//     ra.ENERGY === rb.ENERGY &&
//     ra.CRYSTAL === rb.CRYSTAL
//   );
// };

// export const applyResourceChange = (
//   base: Resources,
//   change: Partial<Resources>,
//   multiplier = 1
// ): Resources => {
//   const updated: Resources = { ...base };
//   for (const key in change) {
//     const typedKey = key as keyof Resources;
//     updated[typedKey] = Math.max(
//       0,
//       updated[typedKey] + (change[typedKey] ?? 0) * multiplier
//     );
//   }
//   return updated;
// };
