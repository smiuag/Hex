export type ShipType =
  | "PROBE"
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

export const ALL_SHIP_TYPES = [
  "PROBE",
  "LIGHTFIGHTER",
  "INTERCEPTOR",
  "ESCORTFRIGATE",
  "BATTLECRUISER",
  "SPACEDESTROYER",
  "ASSAULTBATTLESHIP",
  "STARCARRIER",
  "HEAVYASSAULTSHIP",
  "ORBITALASSAULTSHIP",
  "PLANETARYDESTROYER",
];

export type ProductionFacilityType = "HANGAR" | "SPACESTATION";

export type ShipData = {
  type: ShipType;
  amount: number;
};

export type Ship = {
  type: ShipType;
  amount: number;
  progress?: {
    startedAt: number;
    targetAmount: number;
    notificationId?: string;
  };
};
