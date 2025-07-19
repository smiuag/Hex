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

export type RequiredResearchs = ResearchRequiredData[];

export type Research = {
  type: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
