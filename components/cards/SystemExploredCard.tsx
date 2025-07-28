import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import ExploredCelestialBody from "../auxiliar/ExploredCelestialBody";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplorePlanet: (systemId: string, planetId: string) => void;
  onCancelExplorePlanet: (systemId: string, planetId: string) => void;
};

export const SystemExploredCard: React.FC<Props> = ({
  system,
  onDiscard,
  onExplorePlanet,
  onCancelExplorePlanet,
  onStelarPortBuild,
}) => {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");

  const handleBuildPort = () => {
    onStelarPortBuild(system.id);
  };

  return (
    <View style={commonStyles.containerCenter} key={system.id}>
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

          <View style={[commonStyles.actionBar]}>
            <Text style={commonStyles.subtitleText}>Construir puerto estelar</Text>
            <TouchableOpacity style={commonStyles.buttonPrimary} onPress={() => handleBuildPort()}>
              <Text style={commonStyles.buttonTextLight}>{t("Construir")}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
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

          <View style={commonStyles.actionBar}>
            <TouchableOpacity
              style={commonStyles.cancelButton}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.cancelButtonText}>{t("Discard")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={commonStyles.cancelButton}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.cancelButtonText}>{t("Construir")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
