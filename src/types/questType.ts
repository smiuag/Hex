export type QuestType =
  | "START"
  | "BUILDING_LAB1"
  | "BUILDING_METALLURGY1"
  | "BUILDING_QUARRY1"
  | "BUILDING_KRYSTALMINE1"
  | "RESEARCH_MINING1"
  | "BUILDING_BASE2"
  | "BUILDING_ANTENNA"
  | "BUILDING_HANGAR"
  | "SHIP_FIRST";

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
