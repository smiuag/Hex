import { STAR_BUILDINGS_COST, STAR_BUILDINGS_DURATION } from "@/src/constants/general";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { StarSystem } from "@/src/types/starSystemTypes";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CountdownTimer } from "./CountdownTimer";
import { FleetIncoming } from "./FleetIncoming";
import { ShipBar } from "./ShipBar";

interface Props {
  system: StarSystem;
  handleTravel: () => void;
  onStarPortBuild: (id: string) => void;
}

export const StarPortBuilding: React.FC<Props> = ({ system, handleTravel, onStarPortBuild }) => {
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
      {system.starPortBuilt ? (
        <>
          <View style={commonStyles.actionBar}>
            <View>
              {system.playerShips && system.playerShips.length > 0 ? (
                <View>
                  <ShipBar ships={system.playerShips} />
                </View>
              ) : (
                <View></View>
              )}
            </View>
            <TouchableOpacity
              style={[
                commonStyles.buttonPrimary,
                !system.starPortBuilt && commonStyles.buttonDisabled,
              ]}
              onPress={() => handleTravel()}
              disabled={!system.starPortBuilt}
            >
              <Text style={commonStyles.buttonTextLight}>{t("Travel")}</Text>
            </TouchableOpacity>
          </View>
          <FleetIncoming system={system} />
        </>
      ) : system.starPortStartedAt ? (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.statusTextYellow}>
            ⏳ {t("inProgress")}:{" "}
            <CountdownTimer
              startedAt={system.starPortStartedAt}
              duration={STAR_BUILDINGS_DURATION}
            />
          </Text>
          <Text style={commonStyles.whiteText}>{t("StarPort")}</Text>
        </View>
      ) : (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.subtitleText}>{t("StarPort")}</Text>
          <TouchableOpacity
            style={commonStyles.buttonPrimary}
            onPress={() =>
              confirmBuild(t("BuildStarPort"), t("StarPortCostMessage"), () =>
                onStarPortBuild(system.id)
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
