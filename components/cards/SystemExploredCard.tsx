import { STELAR_BUILDINGS_COST, STELAR_BUILDINGS_DURATION } from "@/src/constants/general";
import { getSystemImage } from "@/utils/starSystemUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import ExploredCelestialBody from "../auxiliar/ExploredCelestialBody";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplorePlanet: (systemId: string, planetId: string) => void;
  onCancelExplorePlanet: (systemId: string, planetId: string) => void;
  onStelarPortBuild: (id: string) => void;
  onDefenseStartBuild: (id: string) => void;
  onExtractionStartBuild: (id: string) => void;
};

export const SystemExploredCard: React.FC<Props> = ({
  system,
  onDiscard,
  onExplorePlanet,
  onCancelExplorePlanet,
  onStelarPortBuild,
  onDefenseStartBuild,
  onExtractionStartBuild,
}) => {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");
  //const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const universe = useGameContextSelector((ctx) => ctx.universe);
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);

  const handleBuildPort = () => {
    Alert.alert(t("BuildStelarPort"), t("StelarPortCostMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          const lockedByResources = !enoughResources(STELAR_BUILDINGS_COST);
          const enoughFreighter = shipBuildQueue.find((f) => f.type == "FREIGHTER" && f.amount > 1);
          if (enoughFreighter && !lockedByResources) onStelarPortBuild(system.id);
          else
            Toast.show({
              type: "info", // "success" | "info" | "error"
              text1: t("NotEnoughForConstruction"),
              position: "top",
              visibilityTime: 2000,
            });
        },
      },
    ]);
  };

  const handleDefenseBuild = () => {
    Alert.alert(t("BuildDefense"), t("DefenseBuildingCostMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          const lockedByResources = !enoughResources(STELAR_BUILDINGS_COST);
          const enoughFreighter = shipBuildQueue.find((f) => f.type == "FREIGHTER" && f.amount > 1);
          if (enoughFreighter && !lockedByResources) onDefenseStartBuild(system.id);
          else
            Toast.show({
              type: "info", // "success" | "info" | "error"
              text1: t("NotEnoughForConstruction"),
              position: "top",
              visibilityTime: 2000,
            });
        },
      },
    ]);
  };

  const handleExtractBuild = () => {
    Alert.alert(t("BuildExtractionBuilding"), t("ExtractionBuildingCostMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          const lockedByResources = !enoughResources(STELAR_BUILDINGS_COST);
          const enoughFreighter = shipBuildQueue.find((f) => f.type == "FREIGHTER" && f.amount > 1);
          if (enoughFreighter && !lockedByResources) onExtractionStartBuild(system.id);
          else
            Toast.show({
              type: "info", // "success" | "info" | "error"
              text1: t("NotEnoughForConstruction"),
              position: "top",
              visibilityTime: 2000,
            });
        },
      },
    ]);
  };

  const image = getSystemImage(system.type);
  const systemData = universe[system.id];
  const systemName = systemData?.name ?? system.id;

  return (
    <View style={commonStyles.containerCenter} key={system.id}>
      <ImageBackground
        source={image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleBlueText}>
              {systemName}{" "}
              <Text style={[commonStyles.whiteText, { fontSize: 16 }]}>
                {" "}
                ({tPlanets(`systemType.${system.type}`)}){" "}
              </Text>
            </Text>
            <Text style={commonStyles.smallSubtitle}>
              {system.distance} {t("parsecs")}
            </Text>
          </View>
          <Text style={[commonStyles.titleText, { textAlign: "center", marginTop: 5 }]}>
            {t("CelestialBodies")}
          </Text>
          <View style={{ marginTop: 5 }}>
            {system.planets.map((planet, index) => (
              <ExploredCelestialBody
                key={planet.id}
                celestialBody={planet}
                system={system}
                onExplorePlanet={onExplorePlanet}
                onCancelExplorePlanet={onCancelExplorePlanet}
              ></ExploredCelestialBody>
            ))}
          </View>
          {system.planets.length == 0 ? (
            <Text style={[commonStyles.subtitleText, { textAlign: "center" }]}>
              {t("VoidSystem")}
            </Text>
          ) : (
            <>
              <Text style={[commonStyles.titleText, { textAlign: "center", marginTop: 10 }]}>
                {t("Instalations")}
              </Text>

              {system.starPortBuilt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("StelarPortBuilt")}</Text>
                </View>
              ) : system.starPortStartedAt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {t("inProgress")}:{" "}
                    <CountdownTimer
                      startedAt={system.starPortStartedAt}
                      duration={STELAR_BUILDINGS_DURATION}
                    />
                  </Text>
                  <Text style={commonStyles.whiteText}>{t("StelarPort")}</Text>
                </View>
              ) : (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("StelarPort")}</Text>
                  <TouchableOpacity
                    style={commonStyles.buttonPrimary}
                    onPress={() => handleBuildPort()}
                  >
                    <Text style={commonStyles.buttonTextLight}>{t("Build")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {system.defenseBuildingBuilt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("DefenseSystemBuilt")}</Text>
                </View>
              ) : system.defenseStartedAt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {t("inProgress")}:{" "}
                    <CountdownTimer
                      startedAt={system.defenseStartedAt}
                      duration={STELAR_BUILDINGS_DURATION}
                    />
                  </Text>
                  <Text style={commonStyles.whiteText}>{t("DefenseSystem")}</Text>
                </View>
              ) : (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("DefenseSystem")}</Text>
                  <TouchableOpacity
                    style={commonStyles.buttonPrimary}
                    onPress={() => handleDefenseBuild()}
                  >
                    <Text style={commonStyles.buttonTextLight}>{t("Build")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {system.extractionBuildingBuilt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("ExtractionSystemBuilt")}</Text>
                </View>
              ) : system.extractionStartedAt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {t("inProgress")}:{" "}
                    <CountdownTimer
                      startedAt={system.extractionStartedAt}
                      duration={STELAR_BUILDINGS_DURATION}
                    />
                  </Text>
                  <Text style={commonStyles.whiteText}>{t("ExtractionSystem")}</Text>
                </View>
              ) : (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>{t("ExtractionSystem")}</Text>
                  <TouchableOpacity
                    style={commonStyles.buttonPrimary}
                    onPress={() => handleExtractBuild()}
                  >
                    <Text style={commonStyles.buttonTextLight}>{t("Build")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          <View style={commonStyles.actionBar}>
            <View></View>

            <TouchableOpacity
              style={commonStyles.buttonPrimary}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.buttonTextLight}>{t("Collect")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      <TouchableOpacity
        style={commonStyles.floatingDeleteButton}
        onPress={() => {
          onDiscard(system.id);
        }}
      >
        <Text style={commonStyles.floatingDeleteText}>💀</Text>
      </TouchableOpacity>
    </View>
  );
};
