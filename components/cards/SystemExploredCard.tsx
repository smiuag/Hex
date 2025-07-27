import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplorePlanet: (systemId: string, planetId: string) => void;
};

export const SystemExploredCard: React.FC<Props> = ({ system, onDiscard, onExplorePlanet }) => {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");
  const totalBodies = system.planets.length;
  const exploredBodies = system.planets.filter((b) => b.explored).length;
  const unexploredBodies = totalBodies - exploredBodies;
  const enoughProbe = true;

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
            {system.planets.map((planet, index) => (
              <View key={index} style={[commonStyles.actionBar, commonStyles.rowSpaceBetween]}>
                <Text style={commonStyles.subtitleText}>
                  {planet.planetType
                    ? tPlanets(`planetType.${planet.planetType}`)
                    : tPlanets(`stelarBody.${planet.type}`)}
                </Text>
                <View>
                  {planet.explored ? (
                    <ResourceDisplay resources={planet.resources} fontSize={12} />
                  ) : (
                    <TouchableOpacity
                      style={commonStyles.buttonPrimary}
                      disabled={!enoughProbe}
                      onPress={() => onExplorePlanet(system.id, planet.id)}
                    >
                      <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={commonStyles.actionBar}>
            <TouchableOpacity
              style={commonStyles.cancelButton}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.cancelButtonText}>{t("Discard")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
