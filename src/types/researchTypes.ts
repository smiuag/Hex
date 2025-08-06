export type ResearchType =
  | "TERRAFORMING"
  | "MINING"
  | "SHIPENGINEERING"
  | "WATERPURIFICATION"
  | "FUELREFINEMENT"
  | "ENERGYEFFICIENCY"
  | "PLASMA"
  | "LASER"
  | "SHIELD"
  | "GRAVITY"
  | "FLUXION"
  | "SELENOGRAFIA"
  | "HEXOXIDO"
  | "ONTOCUANTICA"
  | "KELSIANO";

export type ResearchData = {
  type: ResearchType;
  level: number;
};

export type ResearchRequiredData = {
  researchType: ResearchType;
  researchLevelRequired: number;
  builddingLevel: number;
};

export type ShipResearchRequiredData = {
  researchType: ResearchType;
  researchLevelRequired: number;
};

export type BuildingRequiredResearch = ResearchRequiredData[];
export type ShipRequiredResearch = ShipResearchRequiredData[];

export type Research = {
  data: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};

export interface ResearchItem {
  key: string;
  name: string;
  currentLevel: number;
  maxLevel: number;
  isAvailable: boolean;
}
