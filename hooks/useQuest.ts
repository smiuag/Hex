import { questConfig } from "@/src/config/questConfig";
import { loadQuests, saveQuests } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { PlayerQuest, QuestType, UpdateQuestOptions } from "@/src/types/questType";
import { CombinedResources } from "@/src/types/resourceTypes";
import { triggerAchievementForQuest } from "@/utils/achievementsUtils";
import { useEffect, useRef, useState } from "react";

export const useQuest = (
  addResources: (modifications: Partial<CombinedResources>) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const questRef = useRef<PlayerQuest[]>([]);

  // Cola para serializar guardados + flag de hidratación
  const saveChain = useRef(Promise.resolve());
  const hydrated = useRef(false);

  // Persistir en serie cada cambio del estado
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const snapshot = questRef.current;
    saveChain.current = saveChain.current
      .then(() => saveQuests(snapshot))
      .catch((e) => console.error("Error saving quests:", e));
  }, [playerQuests]);

  // Cargar del storage
  const loadData = async () => {
    const saved = await loadQuests();
    if (saved) {
      questRef.current = saved;
      setPlayerQuests(saved);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper para modificar estado de forma segura y sincronizar el ref
  const modifyQuests = (modifier: (prev: PlayerQuest[]) => PlayerQuest[]) => {
    setPlayerQuests((prev) => {
      const next = modifier(prev);
      questRef.current = next;
      return next;
    });
  };

  const updateQuest = async ({
    type,
    available,
    viewed,
    completed,
    rewardClaimed,
  }: UpdateQuestOptions) => {
    const config = questConfig[type];
    const quest = questRef.current.find((q) => q.type === type);
    const justClaimed = rewardClaimed === true && quest && !quest.rewardClaimed;
    const exists = !!quest;

    await modifyQuests((prev) => {
      const updated = prev.map((q) =>
        q.type !== type
          ? q
          : {
              ...q,
              ...(available !== undefined && { available }),
              ...(viewed !== undefined && { viewed }),
              ...(completed !== undefined && { completed }),
              ...(rewardClaimed !== undefined && { rewardClaimed }),
            }
      );

      if (!exists) {
        const newQuest: PlayerQuest = {
          type,
          available: available ?? false,
          viewed: viewed ?? false,
          completed: completed ?? false,
          rewardClaimed: rewardClaimed ?? false,
        };
        return [...updated, newQuest];
      }

      return updated;
    });

    if (justClaimed) {
      addResources(config.reward);
      handleQuestCompleted(type);
    }
  };

  const handleQuestCompleted = (type: QuestType) => {
    switch (type) {
      case "START":
        updateQuest({
          type: "H2O_SEARCH",
          available: true,
          completed: questRef.current.some((q) => q.type == "H2O_SEARCH" && q.completed)
            ? true
            : false,
          viewed: false,
          rewardClaimed: false,
        });
        break;
      case "H2O_SEARCH":
        updateQuest({
          type: "BUILDING_LAB1",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_LAB1" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_LAB1":
        updateQuest({
          type: "RESEARCH_MINING1",
          available: true,
          completed: questRef.current.some((q) => q.type == "RESEARCH_MINING1" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "RESEARCH_MINING1":
        updateQuest({
          type: "BUILDING_QUARRY1",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_QUARRY1" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_QUARRY1":
        updateQuest({
          type: "BUILDING_METALLURGY1",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_METALLURGY1" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_METALLURGY1":
        updateQuest({
          type: "BUILDING_KRYSTALMINE1",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_KRYSTALMINE1" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_KRYSTALMINE1":
        updateQuest({
          type: "H2O_FOUND",
          available: true,
          completed: questRef.current.some((q) => q.type == "H2O_FOUND" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
      case "H2O_FOUND":
        updateQuest({
          type: "BUILDING_BASE2",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_BASE2" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        updateQuest({
          type: "ALIEN_TECH_FOUND",
          available: true,
          completed: questRef.current.some((q) => q.type == "ALIEN_TECH_FOUND" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_BASE2":
        updateQuest({
          type: "BUILDING_ANTENNA",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_ANTENNA" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_ANTENNA":
        updateQuest({
          type: "SCAN_FIRST",
          available: true,
          completed: questRef.current.some((q) => q.type == "SCAN_FIRST" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "SCAN_FIRST":
        updateQuest({
          type: "BUILDING_EMBASSY",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_EMBASSY" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_EMBASSY":
        updateQuest({
          type: "BUILDING_HANGAR",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_HANGAR" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_HANGAR":
        updateQuest({
          type: "SHIP_FIRST",
          available: true,
          completed: questRef.current.some((q) => q.type == "SHIP_FIRST" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "SHIP_FIRST":
        updateQuest({
          type: "EXPLORE_SYSTEM",
          available: true,
          completed: questRef.current.some((q) => q.type == "EXPLORE_SYSTEM" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "H2O_FOUND":
        updateQuest({
          type: "ALIEN_TECH_FOUND",
          available: true,
          completed: questRef.current.some((q) => q.type == "ALIEN_TECH_FOUND" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "EXPLORE_SYSTEM":
        updateQuest({
          type: "SYSTEM_BUILT_EXTRACTION",
          available: true,
          completed: questRef.current.some(
            (q) => q.type == "SYSTEM_BUILT_EXTRACTION" && q.completed
          )
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "SYSTEM_BUILT_EXTRACTION":
        updateQuest({
          type: "SYSTEM_BUILT_STARPORT",
          available: true,
          completed: questRef.current.some((q) => q.type == "SYSTEM_BUILT_STARPORT" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "SYSTEM_BUILT_STARPORT":
        updateQuest({
          type: "COLLECT",
          available: true,
          completed: questRef.current.some((q) => q.type == "COLLECT" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
      case "COLLECT":
        updateQuest({
          type: "SYSTEM_BUILT_DEFENSE",
          available: true,
          completed: questRef.current.some((q) => q.type == "SYSTEM_BUILT_DEFENSE" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "ALIEN_TECH_FOUND":
        updateQuest({
          type: "BUILDING_ALIEN_LAB",
          available: true,
          completed: questRef.current.some((q) => q.type == "BUILDING_ALIEN_LAB" && q.completed)
            ? true
            : false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
    }

    triggerAchievementForQuest(type, onAchievementEvent);
  };

  const resetQuests = async () => {
    modifyQuests(() => []);
  };

  const getCompletedQuestTypes = (): QuestType[] =>
    questRef.current.filter((q) => q.completed).map((q) => q.type);

  const hasNewQuests = (): boolean => {
    return Object.values(questConfig).some((quest) => {
      const isCompleted = questRef.current.some((q) => q.type === quest.type && q.completed);
      const isViewed = questRef.current.some((q) => q.type === quest.type && q.viewed);
      return !isCompleted && !isViewed;
    });
  };

  return {
    playerQuests,
    updateQuest,
    resetQuests,
    getCompletedQuestTypes,
    hasNewQuests,
  };
};
