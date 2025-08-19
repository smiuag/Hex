import { buildingConfig } from "@/src/config/buildingConfig";
import { commonStyles } from "@/src/styles/commonStyles";
import { getBuildTime } from "@/utils/buildingUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import HeaderClose from "../auxiliar/HeaderClose";
import ResearchList from "../auxiliar/ResearchList";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

export default function LabComponent() {
  const { q, r } = useLocalSearchParams();
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const { t: tBuilding } = useTranslation("buildings");

  const router = useRouter();
  const qNum = parseInt(q as string, 10);
  const rNum = parseInt(r as string, 10);
  const data = hexes.find((h) => h.q == qNum && h.r == rNum);

  if (!data) return;

  const labType = data.building?.type || data.construction?.building;

  const isMaxed = data.building?.level == buildingConfig[labType!].maxLvl;
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

  return isMaxed ? (
    <>
      <HeaderClose title={tBuilding(`buildingName.${labType}`)} onClose={onClose} />
      <View style={{ flex: 1 }}>
        <ResearchList labType={labType!}></ResearchList>
      </View>
    </>
  ) : (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onClose} style={commonStyles.closeXButton}>
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>
      {getMainArea()}
      <ResearchList labType={labType!}></ResearchList>
    </View>
  );
}
