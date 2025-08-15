import { AchievementConfig, AchievementEvent, AchievementType } from "@/src/types/achievementTypes";
import { QuestType } from "@/src/types/questType";

export function defaultProgress() {
  return { progress: 0, unlockedTier: 0, claimedTier: 0, nextThreshold: 0, ratio: 0 };
}

export function getProgressSafe(getProgress: (id: string) => any, id: string) {
  try {
    const gp = getProgress?.(id);
    if (!gp) return defaultProgress();
    // rellena faltantes por si el hook no los devuelve todos
    return { ...defaultProgress(), ...gp };
  } catch {
    return defaultProgress();
  }
}

export function pointsOfTier(cfg: AchievementConfig, unlockedTier: number): number {
  const t = unlockedTier > 0 ? cfg.tiers.find((x) => x.tier === unlockedTier) : cfg.tiers[0];
  return t?.points ?? 0;
}

// ahora usa getProgressSafe para evitar undefined internos
export function getProgressRatioSafe(getProgress: (id: string) => any, id: string): number {
  try {
    const p = getProgressSafe(getProgress, id);
    return p?.ratio ?? 0;
  } catch {
    return 0;
  }
}

export const questToAchievementId = (qt: QuestType): AchievementType | null => {
  switch (qt) {
    case "SYSTEM_BUILT_DEFENSE":
      return "TUTORIAL_COMPLETE";
    case "BUILDING_LAB1":
      return "FIRST_LAB";
    case "H2O_FOUND":
      return "H2O_FOUND";
    case "BUILDING_EMBASSY":
      return "ESTABLISH_EMBASSY";
    case "BUILDING_BASE2":
      return "BASE_LEVEL_2";
    case "EXPLORE_SYSTEM":
      return "FIRST_SYSTEM_EXPLORED";
    case "SYSTEM_BUILT_STARPORT":
      return "STARPORT_BUILT";
    case "SYSTEM_BUILT_DEFENSE":
      return "DEFENSES_ONLINE";
    default:
      return null;
  }
};

export const triggerAchievementForQuest = (
  type: QuestType,
  onEvent: (achievement: AchievementEvent) => void
) => {
  const ach = questToAchievementId(type);
  if (ach) onEvent({ type: "trigger", key: ach });
};
