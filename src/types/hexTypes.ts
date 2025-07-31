import { BuildingData, BuildingType } from "../types/buildingTypes";
import { TerrainType } from "../types/terrainTypes";

export type Hex = {
  q: number;
  r: number;
  isVisible: boolean;
  isTerraformed: boolean;
  isRadius: boolean;
  terrain: TerrainType;
  building?: BuildingData | null;
  previousBuilding?: BuildingData | null;
  groupId?: string; // mismo groupId para hexágonos unidos
  isGroupLeader?: boolean; // solo uno dibujará la imagen
  construction?: {
    building: BuildingType;
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
