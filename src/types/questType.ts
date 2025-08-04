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
  | "SHIP_FIRST"
  | "H2O_SEARCH"
  | "H2O_FOUND"
  | "ALIEN_TECH_FOUND";

export type Quest = {
  type: QuestType;
  description: string;
  requiredQuest: QuestType[];
  name: string;
};

export type PlayerQuest = {
  available: boolean;
  viewed: boolean;
  completed: boolean;
  rewardClaimed: boolean;
  type: QuestType;
};

export type UpdateQuestOptions = {
  type: QuestType;
  available?: boolean;
  viewed?: boolean;
  completed?: boolean;
  rewardClaimed?: boolean;
};

export type ContextType = "GENERAL" | "RESEARCH" | "BUILD" | "FLEET" | "ATTACK" | "DEFENSE";
