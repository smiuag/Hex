import { useGameContext } from "@/src/context/GameContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { resourceEmojis } from "../../src/config/resourceConfig";
import { shipConfig } from "../../src/config/shipConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceType, SpecialResourceType } from "../../src/types/resourceTypes";
import { StarSystem } from "../../src/types/starSystemTypes";
import { getFlyTime } from "../../utils/shipUtils";
import { getExpectedResourceProbabilities, getSystemImage } from "../../utils/starSystemUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplore: (id: string) => void;
  onCancelExploreSystem: (id: string) => void;
};

export const SystemUnknownCard: React.FC<Props> = ({
  system,
  onDiscard,
  onExplore,
  onCancelExploreSystem,
}) => {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");
  const { t: tResources } = useTranslation("resources");
  const expected = getExpectedResourceProbabilities(system.type);
  const isBeingExplored = !!system.explorationFleetId;

  const { shipBuildQueue, fleet } = useGameContext();

  const probeSpeed = shipConfig["PROBE"].speed;
  const timeToExplore = getFlyTime(probeSpeed, system.distance);

  const startTime = system.explorationFleetId
    ? fleet.find((f) => f.id === system.explorationFleetId)?.startTime
    : undefined;

  const handleExplorePress = (systemId: string) => {
    if (shipBuildQueue.find((s) => s.type == "PROBE" && s.amount > 0)) onExplore(systemId);
    else
      Toast.show({
        type: "info", // "success" | "info" | "error"
        text1: "No hay sondas disponibles para la exploración",
        position: "top",
        visibilityTime: 2000,
      });
  };

  const image = getSystemImage(system.type);

  return (
    <View style={commonStyles.containerCenter} key={system.id}>
      <ImageBackground
        source={image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleBlueText}>{tPlanets(`systemType.${system.type}`)}</Text>
            <Text style={commonStyles.whiteText}>
              {system.distance} {t("parsecs")}
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={commonStyles.subtitleText}>{t("ExpectedResources")}:</Text>
            {Object.entries(expected)
              .sort(([, a], [, b]) => b - a)
              .map(([resType, chance]) => {
                const emoji = resourceEmojis[resType as ResourceType | SpecialResourceType] ?? "❔";
                const percent = Math.round(chance * 100);
                return (
                  <Text
                    key={resType}
                    style={[commonStyles.subtitleText, { fontSize: 12, marginVertical: 1 }]}
                  >
                    {emoji} {percent}% {t("chanceToGet")} {tResources(`resourceType.${resType}`)}
                  </Text>
                );
              })}
          </View>

          {isBeingExplored ? (
            <View style={commonStyles.actionBar}>
              <Text style={commonStyles.statusTextYellow}>
                ⏳ {t("inProgress")}:{" "}
                <CountdownTimer startedAt={startTime} duration={timeToExplore} />
              </Text>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => onCancelExploreSystem(system.id)}
              >
                <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={commonStyles.actionBar}>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => onDiscard(system.id)}
              >
                <Text style={commonStyles.cancelButtonText}>{t("Discard")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={commonStyles.buttonPrimary}
                onPress={() => handleExplorePress(system.id)}
              >
                <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};
