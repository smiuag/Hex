import { shipConfig } from "@/src/config/shipConfig";
import { useGameContextSelector } from "@/src/context/GameContext";
import { getFlyTime } from "@/utils/shipUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { commonStyles } from "../../src/styles/commonStyles";
import { CelestialBody, StarSystem } from "../../src/types/starSystemTypes";
import { CountdownTimer } from "./CountdownTimer";
import { ResourceDisplay } from "./ResourceDisplay";

interface Props {
  celestialBody: CelestialBody;
  system: StarSystem;
  onExplorePlanet: (systemId: string, planetId: string) => void;
  onCancelExplorePlanet: (systemId: string, planetId: string) => void;
}

export default function ExploredCelestialBody({
  celestialBody,
  system,
  onExplorePlanet,
  onCancelExplorePlanet,
}: Props) {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");
  const isBeingExplored = !!celestialBody.explorationStartedAt;
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);

  const probeSpeed = shipConfig["PROBE"].speed;
  const timeToExplore = getFlyTime(probeSpeed, system.distance);

  const handleExplorePress = () => {
    if (shipBuildQueue.find((s) => s.type == "PROBE" && s.amount > 0))
      onExplorePlanet(system.id, celestialBody.id);
    else
      Toast.show({
        type: "info", // "success" | "info" | "error"
        text1: "No hay sondas disponibles para la exploración",
        position: "top",
        visibilityTime: 2000,
      });
  };

  return (
    <View>
      {celestialBody.explored ? (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.subtitleText}>
            {celestialBody.planetType
              ? tPlanets(`planetType.${celestialBody.planetType}`)
              : tPlanets(`stelarBody.${celestialBody.type}`)}
          </Text>
          <ResourceDisplay resources={celestialBody.production}></ResourceDisplay>
        </View>
      ) : isBeingExplored ? (
        <View style={[commonStyles.actionBar]}>
          <View>
            <Text style={commonStyles.statusTextYellow}>⏳ {t("inProgress")}: </Text>
            <CountdownTimer
              startedAt={celestialBody.explorationStartedAt}
              duration={timeToExplore}
            />
          </View>

          <TouchableOpacity
            style={commonStyles.cancelButton}
            onPress={() => onCancelExplorePlanet(system.id, celestialBody.id)}
          >
            <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[commonStyles.actionBar]}>
          <Text style={commonStyles.subtitleText}>
            {celestialBody.planetType
              ? tPlanets(`planetType.${celestialBody.planetType}`)
              : tPlanets(`stelarBody.${celestialBody.type}`)}
          </Text>
          <TouchableOpacity style={commonStyles.buttonPrimary} onPress={() => handleExplorePress()}>
            <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
