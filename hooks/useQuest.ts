import { useEffect, useRef, useState } from "react";
import { questConfig } from "../src/config/questConfig";
import { loadQuests, saveQuests } from "../src/services/storage";
import { PlayerQuest, QuestType } from "../src/types/questType";

export const useQuest = () => {
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

    await updateQuestState(updated);
  };

  const markQuestsAsViewed = async (questTypes: QuestType[]) => {
    const updated = questsRef.current.map((quest) => {
      if (questTypes.includes(quest.type) && !quest.viewed) {
        return { ...quest, viewed: true };
      }
      return quest;
    });

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
