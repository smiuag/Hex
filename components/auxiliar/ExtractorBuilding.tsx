import { shipConfig } from "@/src/config/shipConfig";
import {
  COLLECT_COST,
  STAR_BUILDINGS_COST,
  STAR_BUILDINGS_DURATION,
} from "@/src/constants/general";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { ShipData } from "@/src/types/shipType";
import { StarSystem } from "@/src/types/starSystemTypes";
import { formatAmount } from "@/utils/generalUtils";
import { checkCargoCollect } from "@/utils/resourceUtils";
import { getFlyTime } from "@/utils/shipUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CountdownTimer } from "./CountdownTimer";
import ResourceBar from "./ResourceBar";

interface Props {
  system: StarSystem;
  onStartCollectSystem: (id: string, usedShips: ShipData[], timeToCollect: number) => void;
  onCancelCollectSystem: (id: string) => void;
  onExtractionStartBuild: (id: string) => void;
}

export const ExtractorBuilding: React.FC<Props> = ({
  system,
  onStartCollectSystem,
  onCancelCollectSystem,
  onExtractionStartBuild,
}) => {
  const { t } = useTranslation("common");
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const specs = useGameContextSelector((ctx) => ctx.specs);

  const freighterSpeed = shipConfig["FREIGHTER"].speed;
  const timeToCollect = getFlyTime(freighterSpeed, system.distance);

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

  const handleCollect = () => {
    const lockedByResources = !enoughResources(COLLECT_COST);
    console.log(lockedByResources);
    const { anyCargo, enoughCapacity, cargoCapacity, usedShips, timeToCollect } = checkCargoCollect(
      shipBuildQueue,
      specs,
      system
    );

    if (anyCargo && !lockedByResources) {
      if (!enoughCapacity) {
        Alert.alert(
          "Recolección",
          "No habrá capacidad de carga disponible para cargar con todos los recursos. ¿Quieres recolectar con la capacidad actual (" +
            formatAmount(cargoCapacity) +
            ")?",
          [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("confirm"),
              style: "destructive",
              onPress: () => {
                onStartCollectSystem(system.id, usedShips, timeToCollect);
              },
            },
          ]
        );
      } else {
        onStartCollectSystem(system.id, usedShips, timeToCollect);
      }
    } else
      Toast.show({
        type: "info", // "success" | "info" | "error"
        text1: t("NotEnoughForCollect"),
        position: "top",
        visibilityTime: 2000,
      });
  };

  const handleCancelCollect = () => {
    onCancelCollectSystem(system.id);
  };

  return (
    <View>
      {system.extractionBuildingBuilt ? (
        <>
          <View style={commonStyles.actionBar}>
            {system.collectStartedAt ? (
              <View>
                <Text style={commonStyles.statusTextYellow}>
                  ⏳ {t("inProgress")}:{" "}
                  <CountdownTimer startedAt={system.collectStartedAt} duration={timeToCollect} />
                </Text>
              </View>
            ) : (
              <View></View>
            )}

            {system.collectStartedAt ? (
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => handleCancelCollect()}
              >
                <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  commonStyles.buttonPrimary,
                  (!system.starPortBuilt || !system.extractionBuildingBuilt) &&
                    commonStyles.buttonDisabled,
                ]}
                onPress={() => handleCollect()}
                disabled={!system.starPortBuilt || !system.extractionBuildingBuilt}
              >
                <Text style={commonStyles.buttonTextLight}>{t("Collect")}</Text>
              </TouchableOpacity>
            )}
          </View>
          {system.extractionBuildingBuilt &&
            Object.entries(system.storedResources.production).filter(([key, value]) => value > 0)
              .length > 0 && (
              <View
                style={[
                  commonStyles.actionBar,
                  Object.entries(system.storedResources.resources).filter(
                    ([key, value]) => value > 0
                  ).length > 5 // Filtramos los recursos con valor > 0
                    ? { flexDirection: "column" }
                    : { flexDirection: "row" },
                ]}
              >
                <ResourceBar
                  storedResources={system.storedResources}
                  miniSyle={true}
                  showSpecial={true}
                />
              </View>
            )}
        </>
      ) : system.extractionStartedAt ? (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.statusTextYellow}>
            ⏳ {t("inProgress")}:{" "}
            <CountdownTimer
              startedAt={system.extractionStartedAt}
              duration={STAR_BUILDINGS_DURATION}
            />
          </Text>
          <Text style={commonStyles.whiteText}>{t("ExtractionSystem")}</Text>
        </View>
      ) : (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.subtitleText}>{t("ExtractionSystem")}</Text>
          <TouchableOpacity
            style={commonStyles.buttonPrimary}
            onPress={() =>
              confirmBuild(t("BuildExtractionBuilding"), t("ExtractionBuildingCostMessage"), () =>
                onExtractionStartBuild(system.id)
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
