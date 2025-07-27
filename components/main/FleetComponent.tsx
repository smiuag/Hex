import React from "react";
import { FlatList } from "react-native";
import { fleetConfig } from "../../src/config/fleetConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { FleetType } from "../../src/types/fleetType";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { FleetCard } from "../cards/FleetCard";

export default function FleetComponent() {
  const { fleetBuildQueue, handleBuildFleet, handleCancelFleet, resources, hexes } =
    useGameContext();

  const hasSpaceStation = hexes.some((h) => h.building?.type === "SPACESTATION");

  const fleetItems = Object.entries(fleetConfig)
    .map(([key, config]) => {
      const type = key as FleetType;
      const queueItem = fleetBuildQueue.find((f) => f.data.type === type);
      const owned = queueItem?.data.amount ?? 0;
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
        canBuild: hasEnoughResources(resources, config.baseCost),
        show: config.productionFacility === "HANGAR" || hasSpaceStation,
        unitTime: config.baseBuildTime,
      };
    })
    .filter((item) => item.show)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <FlatList
      data={fleetItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={commonStyles.flatList}
      renderItem={({ item }) => (
        <FleetCard
          item={item}
          disableButton={false} // puedes ajustar si solo 1 puede construirse a la vez
          onBuild={handleBuildFleet}
          onCancel={handleCancelFleet}
        />
      )}
    />
  );
}
