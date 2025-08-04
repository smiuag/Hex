import React from "react";
import { FlatList } from "react-native";
import { researchConfig } from "../../src/config/researchConfig";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResearchType } from "../../src/types/researchTypes";
import { getResearchCost, getResearchTime, isUnlocked } from "../../utils/researchUtils";
import { ResearchCard } from "../cards/ResearchCard";

export default function ResearchComponent() {
  const research = useGameContextSelector((ctx) => ctx.research);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const handleResearch = useGameContextSelector((ctx) => ctx.handleResearch);
  const handleCancelResearch = useGameContextSelector((ctx) => ctx.handleCancelResearch);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);

  console.log("Montado ResearchComponent");
  const researchItems = Object.entries(researchConfig)
    .map(([key, config]) => {
      const type = key as ResearchType;
      const data = (research || []).find((r) => r.data.type === type);
      const currentLevel = data?.data.level ?? 0;
      const inProgress = !!data?.progress;
      const targetLevel = data?.progress?.targetLevel ?? currentLevel + 1;
      const totalTime = getResearchTime(type, targetLevel);

      const remainingTime = inProgress
        ? Math.max(0, totalTime - (Date.now() - (data?.progress?.startedAt ?? 0)))
        : 0;

      const scaledCost = getResearchCost(type, targetLevel);
      const hasResources = enoughResources(scaledCost);

      const isAvailable = isUnlocked(type, 1, hexes);
      const isMaxed = currentLevel >= config.maxLevel;

      return {
        key: type,
        ...config,
        type,
        currentLevel,
        isAvailable,
        inProgress,
        remainingTime,
        isMaxed,
        hasResources,
        cost: scaledCost,
        progress: data?.progress,
        totalTime,
      };
    })
    .sort((a, b) => {
      if (a.isMaxed && !b.isMaxed) return 1;
      if (!a.isMaxed && b.isMaxed) return -1;

      if (!a.isAvailable && b.isAvailable) return 1;
      if (a.isAvailable && !b.isAvailable) return -1;

      return a.order - b.order;
    });

  const anyInProgress = researchItems.some((item) => item.inProgress);

  return (
    <FlatList
      data={researchItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={commonStyles.flatList}
      renderItem={({ item }) => (
        <ResearchCard
          hexes={hexes}
          item={item}
          disableButton={anyInProgress && !item.inProgress}
          onResearch={handleResearch}
          onCancel={handleCancelResearch}
        />
      )}
    />
  );
}
