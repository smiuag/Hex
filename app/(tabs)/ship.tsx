import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../components/auxiliar/ResourceBar";
import { ShipSummaryBar } from "../../components/auxiliar/ShipSummaryBar";
import ShipComponent from "../../components/main/ShipComponent";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";

export default function ShipScreen() {
  const totalShipCounts: Partial<Record<ShipType, number>> = {};
  const insets = useSafeAreaInsets();
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const resources = useGameContextSelector((ctx) => ctx.resources);

  const isFocused = useIsFocused();
  if (!isFocused) return null;

  shipBuildQueue.forEach((ship) => {
    const type = ship.type;
    totalShipCounts[type] = (totalShipCounts[type] ?? 0) + ship.amount;
  });

  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <ShipSummaryBar shipCounts={totalShipCounts} />
      <ShipComponent />
      <ResourceBar storedResources={resources} />
    </SafeAreaView>
  );
}
