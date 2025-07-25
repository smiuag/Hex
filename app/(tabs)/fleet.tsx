import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FleetComponent from "../../components/main/FleetComponent";
import { FleetSummaryBar } from "../../components/secondary/FleetSummaryBar";
import ResourceBar from "../../components/secondary/ResourceBar";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { FleetType } from "../../src/types/fleetType";

export default function GalaxyScreen() {
  const totalFleetCounts: Partial<Record<FleetType, number>> = {};
  const insets = useSafeAreaInsets();

  const { fleetBuildQueue } = useGameContext();

  fleetBuildQueue.forEach((fleet) => {
    const type = fleet.data.type;
    totalFleetCounts[type] = (totalFleetCounts[type] ?? 0) + fleet.data.amount;
  });

  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <FleetSummaryBar fleetCounts={totalFleetCounts} />
      <FleetComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
