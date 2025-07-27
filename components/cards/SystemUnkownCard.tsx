import { fleetConfig } from "@/src/config/fleetConfig";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { resourceEmojis } from "../../src/config/resourceConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceType, SpecialResourceType } from "../../src/types/resourceTypes";
import { StarSystem } from "../../src/types/starSystemTypes";
import { getFlyTime } from "../../utils/fleetUtils";
import { getExpectedResourceProbabilities } from "../../utils/starSystemUtils";
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
  const enoughProbe = true;
  const isBeingExplored = !!system.explorationStartedAt;

  const probeSpeed = fleetConfig["PROBE"].speed;
  const timeToExplore = getFlyTime(probeSpeed, system.distance);

  return (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={system.image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleText}>{tPlanets(`systemType.${system.type}`)}</Text>
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
                <CountdownTimer startedAt={system.explorationStartedAt} duration={timeToExplore} />
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
                disabled={!enoughProbe}
                onPress={() => onExplore(system.id)}
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
