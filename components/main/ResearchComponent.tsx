import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { researchTechnologies } from "../../src/config/researchConfig";
import { useGameContext } from "../../src/context/GameContext";
import { ResearchType } from "../../src/types/researchTypes";
import { formatDuration } from "../../utils/generalUtils";
import { getResearchCost, getResearchTime } from "../../utils/researchUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResearchCard } from "../secondary/ResearchCard";

export default function ResearchComponent() {
  const {
    research,
    labLevel,
    resources,
    handleResearch,
    handleCancelResearch,
  } = useGameContext();
  console.log("Research");

  const researchItems = Object.entries(researchTechnologies)
    .map(([key, config]) => {
      const type = key as ResearchType;
      const data = (research || []).find((r) => r.data.type === type);
      const currentLevel = data?.data.level ?? 0;
      const inProgress = !!data?.progress;
      const targetLevel = data?.progress?.targetLevel ?? currentLevel + 1;
      const totalTime = getResearchTime(type, targetLevel);
      const remainingTime = inProgress
        ? Math.max(
            0,
            totalTime - (Date.now() - (data?.progress?.startedAt ?? 0))
          )
        : 0;

      const scaledCost = getResearchCost(type, targetLevel);
      const hasResources = hasEnoughResources(resources, scaledCost);
      const isAvailable = labLevel >= config.labLevelRequired;
      const time = formatDuration(getResearchTime(type, currentLevel + 1));
      const isMaxed = currentLevel >= config.maxLevel;

      return {
        key: type,
        ...config,
        type,
        currentLevel,
        isAvailable,
        inProgress,
        remainingTime,
        time,
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

      // desempate por labLevel y nombre ANTES de recursos
      if (a.labLevelRequired === b.labLevelRequired) {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
      }
      return a.labLevelRequired - b.labLevelRequired;
    });

  const anyInProgress = researchItems.some((item) => item.inProgress);

  return (
    <FlatList
      data={researchItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ResearchCard
          item={item}
          disableButton={anyInProgress && !item.inProgress}
          onResearch={handleResearch}
          onCancel={handleCancelResearch}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 35,
    textAlign: "center",
  },
});
