import React from "react";
import { FlatList } from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";
import { QuestCard } from "../cards/QuestCard";

export default function QuestComponent() {
  const { playerQuests, hexes, research, shipBuildQueue, completeQuest } = useGameContext();

  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  const availableQuests = Object.values(questConfig)
    .filter((quest) => shouldShowQuest(quest.type, completedTypes))
    .sort((a, b) => b.order - a.order);

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={availableQuests}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => {
        const completed = canCompleteQuest(item.type, hexes, research, shipBuildQueue);

        const isAlreadyClaimed = playerQuests.some((pq) => pq.completed && pq.type == item.type);

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
