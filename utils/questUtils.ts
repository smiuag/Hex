import { questConfig } from "../src/config/questConfig";
import { QuestType } from "../src/types/questType";

export function shouldShowQuest(
  questType: QuestType,
  completedQuests: QuestType[]
): boolean {
  const config = questConfig[questType];
  if (!config) return false;

  const isCompleted = completedQuests.includes(questType);
  const hasRequirements = config.requiredQuest.every((req) =>
    completedQuests.includes(req)
  );

  return !isCompleted && hasRequirements;
}

export function canCompleteQuest(type: QuestType): boolean {
  // En el futuro puedes hacer:
  // if (type === "RESEARCH_TERRAFORMING1") { ... }

  return true;
}
