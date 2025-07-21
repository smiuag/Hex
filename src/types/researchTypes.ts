export type ResearchType =
  | "TERRAFORMING"
  | "MINING"
  | "SHIPENGINEERING"
  | "WATERPURIFICATION"
  | "FUELREFINEMENT"
  | "ENERGIEFFICIENCY"
  | "PLASMA"
  | "LASER"
  | "SHIELD"
  | "GRAVITY";

export type ResearchData = {
  type: ResearchType;
  level: number;
};

export type BuildingResearchRequiredData = {
  researchType: ResearchType;
  researchLevelRequired: number;
  builddingLevel: number;
};

export type FleetResearchRequiredData = {
  researchType: ResearchType;
  researchLevelRequired: number;
};

export type BuildingRequiredResearch = BuildingResearchRequiredData[];
export type FleetRequiredResearch = FleetResearchRequiredData[];

export type Research = {
  data: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
