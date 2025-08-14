import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { getBuildTime } from "@/utils/buildingUtils";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DiplomacySummary from "../auxiliar/DiplomacySummary";
import EventCard from "../cards/EventCard";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

export default function EmbassyComponent() {
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const playerDiplomacy = useGameContextSelector((ctx) => ctx.playerDiplomacy);
  const currentEvent = useGameContextSelector((ctx) => ctx.currentEvent);
  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const handleEventOptionChoose = useGameContextSelector((ctx) => ctx.handleEventOptionChoose);

  const router = useRouter();

  const data = hexes.find(
    (h) => h.building?.type == "EMBASSY" || h.construction?.building == "EMBASSY"
  );

  if (!data) return null;

  const onCancel = () => {
    handleCancelBuild(data.q, data.r);
  };

  const onBuild = () => {
    if (data.building) handleBuild(data.q, data.r, data.building.type);
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity onPress={onClose} style={commonStyles.closeXButton}>
          <Text style={commonStyles.closeXText}>✕</Text>
        </TouchableOpacity>
        {getMainArea()}
        {currentEvent && currentEvent.type != "DEFAULT" && (
          <EventCard
            diplomaticEvent={currentEvent}
            onChoose={(opt) => {
              handleEventOptionChoose(opt);
            }}
          />
        )}

        <DiplomacySummary data={playerDiplomacy} />
      </ScrollView>
    </View>
  );
}
