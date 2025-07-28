import { useEffect, useState } from "react";
import { questConfig } from "../src/config/questConfig";
import { loadQuests, saveQuests } from "../src/services/storage";
import { PlayerQuest, QuestType } from "../src/types/questType";
import { Resources } from "../src/types/resourceTypes";

export const useQuest = (addResources: (modifications: Partial<Resources>) => void) => {
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);

  const updateQuestState = async (
    updater: PlayerQuest[] | ((prev: PlayerQuest[]) => PlayerQuest[])
  ) => {
    setPlayerQuests((prev) => {
      const newQuests = typeof updater === "function" ? updater(prev) : updater;
      saveQuests(newQuests); // no await aquí para no bloquear render
      return newQuests;
    });
  };

  const loadData = async () => {
    const saved = await loadQuests();
    if (saved) {
      setPlayerQuests(saved);
    }
  };

  const completeQuest = async (type: QuestType) => {
    const config = questConfig[type];

    updateQuestState((prev) => {
      const updated = [...prev];
      const existing = updated.find((q) => q.type === type);

      if (existing) {
        existing.completed = true;
        existing.viewed = true;
      } else {
        updated.push({ type, completed: true, viewed: true });
      }

      return updated;
    });

    addResources(config.reward);
  };

  const markQuestsAsViewed = async (questTypes: QuestType[]) => {
    updateQuestState((prev) => {
      const updatedMap = new Map<QuestType, PlayerQuest>();

      for (const quest of prev) {
        updatedMap.set(quest.type, quest);
      }

      for (const type of questTypes) {
        const existing = updatedMap.get(type);

        if (existing && !existing.viewed) {
          updatedMap.set(type, { ...existing, viewed: true });
        } else if (!existing) {
          updatedMap.set(type, { type, completed: false, viewed: true });
        }
      }

      return Array.from(updatedMap.values());
    });
  };

  const resetQuests = async () => {
    updateQuestState([]);
  };

  const getCompletedQuestTypes = (): QuestType[] =>
    playerQuests.filter((q) => q.completed).map((q) => q.type);

  const hasNewQuests = (): boolean => {
    return Object.values(questConfig).some((quest) => {
      const isCompleted = playerQuests.some((q) => q.type === quest.type && q.completed);
      const isViewed = playerQuests.some((q) => q.type === quest.type && q.viewed);
      return !isCompleted && !isViewed;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    playerQuests,
    completeQuest,
    markQuestsAsViewed,
    resetQuests,
    getCompletedQuestTypes,
    hasNewQuests,
  };
};
