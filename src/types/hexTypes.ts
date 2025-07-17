import { BuildingData, BuildingType } from "../types/buildingTypes";
import { TerrainType } from "../types/terrainTypes";

export type Hex = {
  q: number;
  r: number;
  isVisible: boolean;
  isRadius: boolean;
  terrain: TerrainType;
  building?: BuildingData | null;
  previousBuilding?: BuildingData | null;
  construction?: {
    building: BuildingType;
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
