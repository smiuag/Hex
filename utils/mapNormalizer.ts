import { Hex, TerrainType } from "../data/tipos";

export function normalizeHexMap(raw: any[]): Hex[] {
  return raw.map((hex) => {
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

    return {
      q: hex.q,
      r: hex.r,
      terrain,
      building,
      construction,
      previousBuilding: hex.previousBuilding ?? null,
    };
  });
}
