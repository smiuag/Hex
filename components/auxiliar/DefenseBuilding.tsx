import { shipStatsEmojis } from "@/src/config/emojisConfig";
import { STAR_BUILDINGS_COST, STAR_BUILDINGS_DURATION } from "@/src/constants/general";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { StarSystem } from "@/src/types/starSystemTypes";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CountdownTimer } from "./CountdownTimer";

interface Props {
  system: StarSystem;
  onDefenseStartBuild: (id: string) => void;
}

export const DefenseBuilding: React.FC<Props> = ({ system, onDefenseStartBuild }) => {
  const { t } = useTranslation("common");
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);

  if (!system) return null;

  const confirmBuild = (title: string, message: string, action: () => void) => {
    Alert.alert(title, message, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: () => {
          const lockedByResources = !enoughResources(STAR_BUILDINGS_COST);
          const enoughFreighter = shipBuildQueue.find((f) => f.type == "FREIGHTER" && f.amount > 1);
          if (enoughFreighter && !lockedByResources) {
            action();
          } else {
            Toast.show({
              type: "info",
              text1: t("NotEnoughForConstruction"),
              position: "top",
              visibilityTime: 2000,
            });
          }
        },
      },
    ]);
  };

  return (
    <View>
      {system.defenseBuildingBuilt ? (
        <View style={[commonStyles.actionBar]}>
          <View>
            <Text style={commonStyles.whiteText}>
              {shipStatsEmojis["attack"] + " 10 " + shipStatsEmojis["defense"] + "30"}
            </Text>
          </View>
          <TouchableOpacity
            style={commonStyles.buttonPrimary}
            onPress={() => {
              return null;
            }}
          >
            <Text style={commonStyles.buttonTextLight}>{t("Improve")}</Text>
          </TouchableOpacity>
        </View>
      ) : system.defenseStartedAt ? (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.statusTextYellow}>
            ⏳ {t("inProgress")}:{" "}
            <CountdownTimer
              startedAt={system.defenseStartedAt}
              duration={STAR_BUILDINGS_DURATION}
            />
          </Text>
          <Text style={commonStyles.whiteText}>{t("DefenseSystem")}</Text>
        </View>
      ) : (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.subtitleText}>{t("DefenseSystem")}</Text>
          <TouchableOpacity
            style={commonStyles.buttonPrimary}
            onPress={() =>
              confirmBuild(t("BuildDefense"), t("DefenseBuildingCostMessage"), () =>
                onDefenseStartBuild(system.id)
              )
            }
          >
            <Text style={commonStyles.buttonTextLight}>{t("Build")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
