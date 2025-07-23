export type FleetType =
  | "LIGHTFIGHTER"
  | "INTERCEPTOR"
  | "ESCORTFRIGATE"
  | "BATTLECRUISER"
  | "SPACEDESTROYER"
  | "ASSAULTBATTLESHIP"
  | "STARCARRIER"
  | "HEAVYASSAULTSHIP"
  | "ORBITALASSAULTSHIP"
  | "PLANETARYDESTROYER";

export type ProductionFacilityType = "HANGAR" | "SPACESTATION";

export type FleetData = {
  type: FleetType;
  amount: number;
};

export type Fleet = {
  data: FleetData;
  progress?: {
    startedAt: number;
    targetAmount: number;
    notificationId?: string;
  };
};
