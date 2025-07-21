import { MAP_SIZES, MapSizeKey } from "../src/constants/general";
import { Hex } from "../src/types/hexTypes";
import { StoredResources } from "../src/types/resourceTypes";
import { TerrainType } from "../src/types/terrainTypes";

export let CURRENT_MAP_SIZE: MapSizeKey = "MEDIUM";

export const generateHexGrid = (radius: number): Hex[] => {
  const hexes = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({
        q,
        r,
        isVisible: false,
        isRadius: false,
        terrain: "initial" as TerrainType,
      });
    }
  }
  return hexes;
};

export const getInitialResources = (): StoredResources => ({
  resources: {
    metal: 360000,
    energy: 1000,
    crystal: 0,
    stone: 360000,
  },
  lastUpdate: Date.now(),
});

export const axialDistance = (
  a: { q: number; r: number },
  b: { q: number; r: number }
): number => {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  );
};

export const normalizeHexMap = (map: any[]): Hex[] => {
  const baseHex = map.find((h) => h.q === 0 && h.r === 0);
  let baseLevel = 0;

  if (baseHex?.building?.type === "BASE") {
    baseLevel = baseHex.building.level;
  } else if (baseHex?.construction?.building === "BASE") {
    baseLevel = baseHex.construction.targetLevel - 1;
  }
  calculateMapSize(baseLevel);
  const visibleRadius = Math.floor(baseLevel / 2) + 1;

  return map.map((hex) => {
    const terrain = hex.terrain as TerrainType;

    const building = hex.building
      ? {
          type: hex.building.type,
          level: hex.building.level ?? 1,
        }
      : null;

    const construction = hex.construction
      ? {
          building: hex.construction.building,
          startedAt: hex.construction.startedAt,
          targetLevel: hex.construction.targetLevel ?? 1,
        }
      : undefined;

    const isVisible =
      axialDistance({ q: 0, r: 0 }, { q: hex.q, r: hex.r }) <= visibleRadius;
    const isRadius =
      axialDistance({ q: 0, r: 0 }, { q: hex.q, r: hex.r }) ===
      visibleRadius + 1;

    return {
      q: hex.q,
      r: hex.r,
      isVisible,
      isRadius,
      terrain,
      building,
      construction,
      previousBuilding: hex.previousBuilding ?? null,
    };
  });
};

export const expandMapAroundBase = (
  currentMap: Hex[],
  newBaseLevel: number
): Hex[] => {
  const radius = Math.floor(newBaseLevel / 2) + 1;
  const borderRadius = radius + 1;

  const updatedMap = currentMap.map((hex) => {
    const dist = axialDistance({ q: 0, r: 0 }, { q: hex.q, r: hex.r });

    if (dist <= radius && hex.terrain === "border") {
      return { ...hex, terrain: "initial" as TerrainType };
    }

    return hex;
  });

  const existingCoords = new Set(updatedMap.map((h) => `${h.q},${h.r}`));
  const newBorders: Hex[] = [];

  for (let q = -borderRadius; q <= borderRadius; q++) {
    for (let r = -borderRadius; r <= borderRadius; r++) {
      const s = -q - r;
      if (Math.abs(s) > borderRadius) continue;

      const dist = axialDistance({ q: 0, r: 0 }, { q, r });
      const key = `${q},${r}`;

      if (dist === borderRadius && !existingCoords.has(key)) {
        newBorders.push({
          q,
          r,
          terrain: "border" as TerrainType,
          building: null,
          construction: undefined,
          isVisible: false,
          isRadius: true,
          previousBuilding: null,
        });
      }
    }
  }

  return [...updatedMap, ...newBorders];
};

export const getCurrentMapSize = () => {
  return MAP_SIZES[CURRENT_MAP_SIZE];
};

const setCurrentMapSize = (size: MapSizeKey) => {
  CURRENT_MAP_SIZE = size;
};

const calculateMapSize = (baseLevel: number) => {
  if (baseLevel > 3) setCurrentMapSize("SMALL");
  else if (baseLevel > 1) setCurrentMapSize("MEDIUM");
  else setCurrentMapSize("LARGE");
};
