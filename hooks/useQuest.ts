import { useEffect, useRef, useState } from "react";
import { questConfig } from "../src/config/questConfig";
import { loadQuests, saveQuests } from "../src/services/storage";
import { PlayerQuest, QuestType } from "../src/types/questType";
import { Resources } from "../src/types/resourceTypes";

export const useQuest = (
  addResources: (modifications: Partial<Resources>) => void
) => {
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const questsRef = useRef<PlayerQuest[]>([]);

  const updateQuestState = async (newQuests: PlayerQuest[]) => {
    setPlayerQuests(newQuests);
    questsRef.current = newQuests;
    await saveQuests(newQuests);
  };

  const loadData = async () => {
    const saved = await loadQuests();
    if (saved) {
      setPlayerQuests(saved);
      questsRef.current = saved;
    }
  };

  const completeQuest = async (type: QuestType) => {
    const updated = [...questsRef.current];
    const existing = updated.find((q) => q.type === type);

    const config = questConfig[type];

    if (existing) {
      existing.completed = true;
      existing.viewed = true;
    } else {
      updated.push({
        type,
        completed: true,
        viewed: true,
      });
    }

    addResources(config.reward);

    await updateQuestState(updated);
  };

  const markQuestsAsViewed = async (questTypes: QuestType[]) => {
    const updatedMap = new Map<QuestType, PlayerQuest>();

    for (const quest of questsRef.current) {
      updatedMap.set(quest.type, quest);
    }

    for (const type of questTypes) {
      const existing = updatedMap.get(type);

      if (existing) {
        if (!existing.viewed) {
          updatedMap.set(type, { ...existing, viewed: true });
        }
      } else {
        updatedMap.set(type, {
          type,
          completed: false,
          viewed: true,
        });
      }
    }

    const updated = Array.from(updatedMap.values());
    await updateQuestState(updated);
  };

  const resetQuests = async () => {
    await updateQuestState([]);
  };

  const getCompletedQuestTypes = (): QuestType[] =>
    questsRef.current.filter((q) => q.completed).map((q) => q.type);

  const hasNewQuests = (): boolean => {
    return Object.values(questConfig).some((quest) => {
      const isCompleted = questsRef.current.some(
        (q) => q.type === quest.type && q.completed
      );
      const isViewed = questsRef.current.some(
        (q) => q.type === quest.type && q.viewed
      );
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
