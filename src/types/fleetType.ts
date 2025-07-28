import { ShipData } from "./shipType";

export type MovementType = "MOVEMENT" | "ATTACK" | "EXPLORE SYSTEM" | "RETURN" | "EXPLORE PLANET";

export type FleetData = {
  movementType: MovementType;
  ships: ShipData[];
  startTime: number;
  endTime: number;
  destinationSystemId: string;
  destinationPlanetId?: string;
  origin: string;
  id: string;
};
