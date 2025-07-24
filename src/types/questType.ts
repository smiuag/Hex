export type QuestType =
  | "START"
  | "BUILDING_LAB1"
  | "BUILDING_METALLURGY1"
  | "BUILDING_QUARRY1"
  | "BUILDING_KRYSTALMINE1"
  | "RESEARCH_MINING1"
  | "BUILDING_BASE2"
  | "BUILDING_HANGAR";

export type Quest = {
  type: QuestType;
  description: string;
  requiredQuest: QuestType[];
  name: string;
};

export type PlayerQuest = {
  type: QuestType;
  completed: boolean;
  viewed: boolean;
};
