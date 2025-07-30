import { getSystemImage } from "@/utils/starSystemUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { BUILDING_COST } from "../../src/constants/building";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import ExploredCelestialBody from "../auxiliar/ExploredCelestialBody";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplorePlanet: (systemId: string, planetId: string) => void;
  onCancelExplorePlanet: (systemId: string, planetId: string) => void;
  onStelarPortBuild: (id: string) => void;
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

  const { resources, shipBuildQueue } = useGameContext();

  const handleBuildPort = () => {
    Alert.alert(t("BuildStelarPort"), t("StelarPortCostMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          const enoughResources = hasEnoughResources(resources, BUILDING_COST.SPACESTATION);
          const enoughFreighter = shipBuildQueue.find((f) => f.type == "FREIGHTER" && f.amount > 1);
          if (enoughFreighter && enoughResources) onStelarPortBuild(system.id);
          else
            Toast.show({
              type: "info", // "success" | "info" | "error"
              text1: "Recursos insuficientes o cargueros insuficientes",
              position: "top",
              visibilityTime: 2000,
            });
        },
      },
    ]);

    onStelarPortBuild(system.id);
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

          <Text style={[commonStyles.titleText, { textAlign: "center", marginTop: 10 }]}>
            Cuerpos celestes
          </Text>
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
          {system.planets.length == 0 ? (
            <Text style={[commonStyles.subtitleText, { textAlign: "center" }]}>
              Ningún cuerpo celeste con recursos aprovechables.
            </Text>
          ) : (
            <>
              <Text style={[commonStyles.titleText, { textAlign: "center", marginTop: 10 }]}>
                Instalaciones
              </Text>

              {system.starPort ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>PUERTO ESTELAR CONSTRUÍDO</Text>
                </View>
              ) : system.starPortStartedAt ? (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {t("inProgress")}:{" "}
                    <CountdownTimer
                      startedAt={system.starPortStartedAt}
                      duration={1000 * 60 * 60 * 24}
                    />
                  </Text>
                  <Text style={commonStyles.whiteText}>Puerto estelar</Text>
                </View>
              ) : (
                <View style={[commonStyles.actionBar]}>
                  <Text style={commonStyles.subtitleText}>Puerto estelar</Text>
                  <TouchableOpacity
                    style={commonStyles.buttonPrimary}
                    onPress={() => handleBuildPort()}
                  >
                    <Text style={commonStyles.buttonTextLight}>{t("Construir")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[commonStyles.actionBar]}>
                <Text style={commonStyles.subtitleText}>Sistema defensivo</Text>
                <TouchableOpacity
                  style={commonStyles.buttonPrimary}
                  onPress={() => handleBuildPort()}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("Construir")}</Text>
                </TouchableOpacity>
              </View>
              <View style={[commonStyles.actionBar]}>
                <Text style={commonStyles.subtitleText}>Sistemas de extracción</Text>
                <TouchableOpacity
                  style={commonStyles.buttonPrimary}
                  onPress={() => handleBuildPort()}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("Construir")}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View style={commonStyles.actionBar}>
            <TouchableOpacity
              style={commonStyles.cancelButton}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.cancelButtonText}>{t("Discard")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={commonStyles.buttonPrimary}
              onPress={() => onDiscard(system.id)}
            >
              <Text style={commonStyles.buttonTextLight}>{t("Collect")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
