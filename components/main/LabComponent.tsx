import { commonStyles } from "@/src/styles/commonStyles";
import { getBuildTime } from "@/utils/buildingUtils";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import ResearchComponent from "../auxiliar/ResearchComponent";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

export default function LabComponent() {
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);

  const router = useRouter();

  const data = hexes.find((h) => h.building?.type == "LAB" || h.construction?.building == "LAB");

  const isFocused = useIsFocused();
  if (!isFocused) return null;
  if (!data) return;

  const onBuild = () => {
    if (data.building) handleBuild(data.q, data.r, data.building.type);
  };

  const onCancel = () => {
    handleCancelBuild(data.q, data.r);
  };

  const onClose = () => {
    router.replace("/(tabs)/planet");
  };

  const getMainArea = () => {
    if (data.construction) {
      const totalBuildTime = getBuildTime(
        data.construction.building,
        data.construction.targetLevel
      );
      return (
        <View style={commonStyles.mainBuilding}>
          <UnderConstructionCard
            data={data}
            onCancelBuild={onCancel}
            duration={totalBuildTime}
            startedAt={data.construction.startedAt}
          />
        </View>
      );
    } else {
      return (
        <View style={commonStyles.mainBuilding}>
          <UpgradeCard data={data} onBuild={onBuild} research={research} />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onClose} style={commonStyles.closeXButton}>
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>
      {getMainArea()}
      <ResearchComponent></ResearchComponent>
    </View>
  );
}
