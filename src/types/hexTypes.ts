import { BuildingData, BuildingType } from "../types/buildingTypes";
import { TerrainType } from "../types/terrainTypes";
import { Resources } from "./resourceTypes";

export type Hex = {
  q: number;
  r: number;
  isVisible: boolean;
  isTerraformed: boolean;
  isRadius: boolean;
  terrain: TerrainType;
  building?: BuildingData | null;
  previousBuilding?: BuildingData | null;
  resources?: Partial<Resources>;
  groupId?: string; // mismo groupId para hexágonos unidos
  isGroupLeader?: boolean; // solo uno dibujará la imagen
  construction?: {
    building: BuildingType;
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
