import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";
import { QuestCard } from "../secondary/QuestCard";

export default function QuestComponent() {
  const { playerQuests, hexes, research, completeQuest, markQuestsAsViewed } =
    useGameContext();

  const hasViewedOnce = useRef(false);

  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  const availableQuests = Object.values(questConfig).filter((quest) =>
    shouldShowQuest(quest.type, completedTypes)
  );

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
      contentContainerStyle={styles.container}
      data={availableQuests}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => {
        const completed = canCompleteQuest(item.type, hexes, research);
        return (
          <QuestCard
            item={item}
            completed={completed}
            onComplete={() => completeQuest(item.type)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 35,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
});
