import { IMAGES } from "@/src/constants/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, ImageBackground } from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";
import { QuestCard } from "../cards/QuestCard";

export default function QuestComponent() {
  const { reload } = useLocalSearchParams();
  const { playerQuests, hexes, research, shipBuildQueue, completeQuest } = useGameContext();
  const router = useRouter();
  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  const availableQuests = Object.values(questConfig)
    .filter((quest) => shouldShowQuest(quest.type, completedTypes))
    .sort((a, b) => b.order - a.order);

  useEffect(() => {
    const completedQuestTypes = playerQuests.filter((q) => q.completed).map((q) => q.type);

    const newQuest = Object.values(questConfig).find((quest) => {
      const isCompleted = completedQuestTypes.includes(quest.type);
      const isAvailable = shouldShowQuest(quest.type, completedQuestTypes);
      const isViewed = playerQuests.some((q) => q.type === quest.type && q.viewed);
      return !isCompleted && !isViewed && isAvailable;
    });
    if (newQuest) {
      router.replace(`/quests/computer?type=${newQuest.type}`);
    }
  }, [playerQuests, reload]);

  return (
    <ImageBackground
      source={IMAGES.BACKGROUND_QUEST_IMAGE}
      style={commonStyles.flex1}
      resizeMode="cover"
    >
      <FlatList
        contentContainerStyle={commonStyles.flatList}
        data={availableQuests}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => {
          const completed = canCompleteQuest(item.type, hexes, research, shipBuildQueue);

          const isAlreadyClaimed = playerQuests.some((pq) => pq.completed && pq.type == item.type);

          return (
            <QuestCard
              key={item.type}
              item={item}
              completed={completed}
              isAlreadyClaimed={isAlreadyClaimed}
              onComplete={() => completeQuest(item.type)}
            />
          );
        }}
      />
    </ImageBackground>
  );
}
