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

export type RequiredResearchs = [ResearchData];

export type Research = {
  type: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
