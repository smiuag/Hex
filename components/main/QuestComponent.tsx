import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList } from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";
import { QuestCard } from "../secondary/QuestCard";

export default function QuestComponent() {
  const {
    playerQuests,
    hexes,
    research,
    fleetBuildQueue,
    completeQuest,
    markQuestsAsViewed,
  } = useGameContext();

  const hasViewedOnce = useRef(false);

  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  const availableQuests = Object.values(questConfig)
    .filter((quest) => shouldShowQuest(quest.type, completedTypes))
    .sort((a, b) => b.order - a.order);

  useFocusEffect(
    useCallback(() => {
      if (!hasViewedOnce.current) {
        const newlyViewed = availableQuests.map((q) => q.type);
        markQuestsAsViewed(newlyViewed);
        hasViewedOnce.current = true;
      }
    }, [availableQuests])
  );

  useEffect(() => {
    if (!hasViewedOnce.current) return;

    const notViewedTypes = availableQuests
      .filter((q) => {
        const quest = playerQuests.find((pq) => pq.type === q.type);
        return !quest || !quest.viewed;
      })
      .map((q) => q.type);

    if (notViewedTypes.length > 0) {
      markQuestsAsViewed(notViewedTypes);
    }
  }, [availableQuests, playerQuests]);

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={availableQuests}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => {
        const completed = canCompleteQuest(
          item.type,
          hexes,
          research,
          fleetBuildQueue
        );

        const isAlreadyClaimed = playerQuests.some(
          (pq) => pq.completed && pq.type == item.type
        );

        return (
          <QuestCard
            item={item}
            completed={completed}
            isAlreadyClaimed={isAlreadyClaimed}
            onComplete={() => completeQuest(item.type)}
          />
        );
      }}
    />
  );
}
