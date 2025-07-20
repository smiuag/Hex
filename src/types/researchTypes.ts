export type ResearchType =
  | "TERRAFORMING"
  | "MINING"
  | "SHIPENGINEERING"
  | "WATERPURIFICATION"
  | "FUELREFINEMENT"
  | "ENERGIEFFICIENCY";

export type ResearchData = {
  type: ResearchType;
  level: number;
};

export type ResearchRequiredData = {
  researchType: ResearchType;
  researchLevelRequired: number;
  builddingLevel: number;
};

export type RequiredResearch = ResearchRequiredData[];

export type Research = {
  data: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
