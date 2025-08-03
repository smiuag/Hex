import { buildingConfig } from "@/src/config/buildingConfig";
import {
  BUILD_COST_INCREMENT,
  BUILD_TIME_INCREMENT,
  GENERAL_FACTOR,
  PRODUCTION_INCREMENT,
} from "@/src/constants/general";
import { BuildingType } from "@/src/types/buildingTypes";
import { Hex } from "@/src/types/hexTypes";
import { BuildingRequiredResearch, Research } from "@/src/types/researchTypes";
import { Resources } from "@/src/types/resourceTypes";

export const getBuildTime = (building: BuildingType, level: number): number => {
  const baseTime = buildingConfig[building].baseBuildTime;
  return Math.round((baseTime * Math.pow(BUILD_TIME_INCREMENT, level - 1)) / GENERAL_FACTOR);
};

export const getBuildCost = (building: BuildingType, level: number): Resources => {
  const config = buildingConfig[building];
  const base = config.baseCost;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = Math.ceil(baseValue * Math.pow(BUILD_COST_INCREMENT, level - 1));
  }

  return result;
};

export const isUnlocked = (
  type: string,
  level: number,
  playerResearch: Research[] = []
): boolean => {
  const config = buildingConfig[type as BuildingType];
  if (!config) return false;

  const requiredResearch = config.requiredResearch;

  if (!requiredResearch || requiredResearch.length === 0) return true;

  const applicableRequirements = requiredResearch.filter((req) => req.builddingLevel <= level);

  return applicableRequirements.every((req) => {
    const found = playerResearch.find((r) => r.data.type === req.researchType);
    return !!found && found.data.level >= req.researchLevelRequired;
  });
};

export const getUnmetRequirements = (
  requiredResearch: BuildingRequiredResearch,
  research: Research[],
  level: number
) => {
  return (
    requiredResearch
      ?.filter((req) => req.builddingLevel <= level)
      .filter((req) => {
        const playerResearchLevel =
          research.find((r) => r.data.type === req.researchType)?.data.level ?? 0;
        return playerResearchLevel < req.researchLevelRequired;
      }) ?? []
  );
};

export const isAtMaxCount = (type: BuildingType, hexes: Hex[]): boolean => {
  const maxAllowed = buildingConfig[type]?.maxNumberInPlanet;
  if (maxAllowed === undefined) return false;
  const count = hexes.filter(
    (h) => h.building?.type === type || h.construction?.building === type
  ).length;

  return count >= maxAllowed;
};

export const getProductionPerSecond = (building: BuildingType, level: number): Resources => {
  const config = buildingConfig[building];
  const base = config.production;
  const result: Resources = {} as Resources;

  for (const key in base) {
    const resource = key as keyof Resources;
    const baseValue = base[resource]!;
    result[resource] = Math.ceil(baseValue * Math.pow(PRODUCTION_INCREMENT, level - 1));
  }

  return result;
};

export const getProductionPerHour = (building: BuildingType, level: number): Resources => {
  const productionPerSecond = getProductionPerSecond(building, level);
  const productionPerHour: Resources = {} as Resources;

  for (const key in productionPerSecond) {
    const resource = key as keyof Resources;
    productionPerHour[resource] = productionPerSecond[resource] * 3600;
  }

  return productionPerHour;
};

// export const getTotalProductionPerHour = (hexes: Hex[]): Partial<Resources> => {
//   const productionTotal: Partial<Resources> = {};

//   hexes.forEach((hex) => {
//     if (hex.building) {
//       const prodAtLevel = getProductionPerHour(
//         hex.building.type,
//         hex.building.level
//       );
//       Object.entries(prodAtLevel).forEach(([res, val]) => {
//         productionTotal[res as keyof Resources] =
//           (productionTotal[res as keyof Resources] || 0) + val;
//       });
//     }
//   });

//   return productionTotal;
// };
