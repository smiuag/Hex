export type ResearchType = "terraforming" | "mining";

export type ResearchData = {
  type: ResearchType;
  level: number;
};

export type Research = {
  type: ResearchData;
  progress?: {
    startedAt: number;
    targetLevel: number;
    notificationId?: string;
  };
};
