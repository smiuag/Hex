import { LogLevel } from "react-native-reanimated/lib/typescript/logger";
import { BuildingType } from "./buildingTypes";
import { CombinedResources } from "./resourceTypes";
import { ShipData } from "./shipType";

export type MovementType =
  | "MOVEMENT"
  | "ATTACK"
  | "EXPLORE SYSTEM"
  | "RETURN"
  | "EXPLORE CELESTIALBODY"
  | "COLLECT";

export type CombatType = "SYSTEM_ATTACK" | "COLONY_ATTACKED" | "BASE_ATTACKED";

export type FleetData = {
  movementType: MovementType;
  ships: ShipData[];
  startTime: number;
  endTime: number;
  destinationSystemId: string;
  destinationPlanetId?: string;
  origin: string;
  id: string;
  resources: CombinedResources;
};

export type CombatSummary = {
  type: CombatType;
  shipsDestroyed: ShipData[];
  shipsLost: ShipData[];
  buildingsAffected: {
    type: BuildingType;
    level: LogLevel;
  }[];
  date: number;
  viewed: boolean;
};
