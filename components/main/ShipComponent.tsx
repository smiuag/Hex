import React from "react";
import { FlatList } from "react-native";
import { shipConfig } from "../../src/config/shipConfig";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";
import { ShipCard } from "../cards/ShipCard";

export default function ShipComponent() {
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const handleBuildShip = useGameContextSelector((ctx) => ctx.handleBuildShip);
  const handleCancelShip = useGameContextSelector((ctx) => ctx.handleCancelShip);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);

  const hasSpaceStation = hexes.some((h) => h.building?.type === "SPACESTATION");

  const shipItems = Object.entries(shipConfig)
    .map(([key, config]) => {
      const type = key as ShipType;
      const queueItem = shipBuildQueue.find((f) => f.type === type);
      const owned = queueItem?.amount ?? 0;
      const inProgress = !!queueItem?.progress;
      const remainingAmount = queueItem?.progress?.targetAmount ?? 0;
      const startedAt = queueItem?.progress?.startedAt ?? 0;
      const totalTime = config.baseBuildTime * remainingAmount;

      return {
        key: type,
        ...config,
        type,
        owned,
        inProgress,
        remainingAmount,
        startedAt,
        totalTime,
        cost: config.baseCost,
        canBuild: enoughResources(config.baseCost),
        show: config.productionFacility === "HANGAR" || hasSpaceStation,
        unitTime: config.baseBuildTime,
      };
    })
    .filter((item) => item.show)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <FlatList
      data={shipItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={commonStyles.flatList}
      renderItem={({ item }) => (
        <ShipCard item={item} onBuild={handleBuildShip} onCancel={handleCancelShip} />
      )}
    />
  );
}
