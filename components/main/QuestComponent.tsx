import { IMAGES } from "@/src/constants/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, ImageBackground } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { QuestCard } from "../cards/QuestCard";

export default function QuestComponent() {
  const { reload } = useLocalSearchParams();
  const playerQuests = useGameContextSelector((ctx) => ctx.playerQuests);
  const updateQuest = useGameContextSelector((ctx) => ctx.updateQuest);
  const router = useRouter();

  const availableQuests = playerQuests.filter((q) => q.available);

  useEffect(() => {
    const newQuest = playerQuests.find((quest) => quest.available && !quest.viewed);
    if (newQuest) {
      router.replace(`/(tabs)/quests/computer?type=${newQuest.type}`);
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
          const isAlreadyClaimed = playerQuests.some(
            (pq) => pq.rewardClaimed && pq.type == item.type
          );
          const isComppleted = playerQuests.some((pq) => pq.completed && pq.type == item.type);

          return (
            <QuestCard
              key={item.type}
              item={item}
              completed={isComppleted}
              isAlreadyClaimed={isAlreadyClaimed}
              onClaimReward={() => updateQuest({ type: item.type, rewardClaimed: true })}
            />
          );
        }}
      />
    </ImageBackground>
  );
}
