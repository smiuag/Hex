import { questConfig } from "@/src/config/questConfig";
import { loadQuests, saveQuests } from "@/src/services/storage";
import { PlayerQuest, QuestType, UpdateQuestOptions } from "@/src/types/questType";
import { Resources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";

export const useQuest = (addResources: (modifications: Partial<Resources>) => void) => {
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const questRef = useRef<PlayerQuest[]>([]);

  const syncAndSave = (newQuests: PlayerQuest[]) => {
    questRef.current = newQuests;
    setPlayerQuests(newQuests);
    saveQuests(newQuests);
  };

  const updateQuestState = async (
    updater: PlayerQuest[] | ((prev: PlayerQuest[]) => PlayerQuest[])
  ) => {
    const updated = typeof updater === "function" ? updater(questRef.current) : updater;
    syncAndSave(updated);
  };

  const loadData = async () => {
    const saved = await loadQuests();
    if (saved) {
      syncAndSave(saved);
    }
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

    await updateQuestState((prev) => {
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

  const handleQuestCompleted = (type: string) => {
    switch (type as QuestType) {
      case "START":
        updateQuest({
          type: "H2O_SEARCH",
          available: true,
          completed: false,
          viewed: false,
          rewardClaimed: false,
        });
        break;
      case "H2O_SEARCH":
        updateQuest({
          type: "BUILDING_LAB1",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_LAB1":
        updateQuest({
          type: "RESEARCH_MINING1",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "RESEARCH_MINING1":
        updateQuest({
          type: "BUILDING_QUARRY1",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_QUARRY1":
        updateQuest({
          type: "BUILDING_METALLURGY1",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_METALLURGY1":
        updateQuest({
          type: "BUILDING_KRYSTALMINE1",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_KRYSTALMINE1":
        updateQuest({
          type: "H2O_FOUND",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
      case "H2O_FOUND":
        updateQuest({
          type: "BUILDING_BASE2",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_BASE2":
        updateQuest({
          type: "BUILDING_ANTENNA",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_ANTENNA":
        updateQuest({
          type: "BUILDING_HANGAR",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "BUILDING_HANGAR":
        updateQuest({
          type: "SHIP_FIRST",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
      case "H2O_FOUND":
        updateQuest({
          type: "ALIEN_TECH_FOUND",
          available: true,
          completed: false,
          rewardClaimed: false,
          viewed: false,
        });
        break;
    }
  };

  const resetQuests = async () => {
    await updateQuestState([]);
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

  useEffect(() => {
    loadData();
  }, []);

  return {
    playerQuests,
    updateQuest,
    resetQuests,
    getCompletedQuestTypes,
    hasNewQuests,
  };
};
