import { getSystemImage } from "@/utils/starSystemUtils";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { DefenseBuilding } from "../auxiliar/DefenseBuilding";
import ExploredCelestialBody from "../auxiliar/ExploredCelestialBody";
import { ExtractorBuilding } from "../auxiliar/ExtractorBuilding";
import { StarPortBuilding } from "../auxiliar/StarPortBuilding";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplorePlanet: (systemId: string, planetId: string) => void;
  onCancelExplorePlanet: (systemId: string, planetId: string) => void;
  onStarPortBuild: (id: string) => void;
  onDefenseStartBuild: (id: string) => void;
  onExtractionStartBuild: (id: string) => void;
  onStartCollectSystem: (id: string) => void;
  onCancelCollectSystem: (id: string) => void;
};

export const SystemExploredCard: React.FC<Props> = ({
  system,
  onDiscard,
  onExplorePlanet,
  onCancelExplorePlanet,
  onStarPortBuild,
  onDefenseStartBuild,
  onExtractionStartBuild,
  onStartCollectSystem,
  onCancelCollectSystem,
}) => {
  const { t } = useTranslation("common");
  const { t: tPlanets } = useTranslation("planets");
  const universe = useGameContextSelector((ctx) => ctx.universe);

  const router = useRouter();

  const handleTravel = () => {
    router.replace(`/(tabs)/galaxy/fleetAttack?systemId=${system.id}`);
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
            {system.celestialBodies.map((planet, index) => (
              <ExploredCelestialBody
                key={planet.id}
                celestialBody={planet}
                system={system}
                onExplorePlanet={onExplorePlanet}
                onCancelExplorePlanet={onCancelExplorePlanet}
              ></ExploredCelestialBody>
            ))}
          </View>
          {system.celestialBodies.length == 0 ? (
            <Text style={[commonStyles.subtitleText, { textAlign: "center" }]}>
              {t("VoidSystem")}
            </Text>
          ) : (
            <>
              <Text style={[commonStyles.titleText, { textAlign: "center", marginTop: 10 }]}>
                {t("Instalations")}
              </Text>

              <StarPortBuilding
                system={system}
                handleTravel={handleTravel}
                onStarPortBuild={onStarPortBuild}
              />
              <DefenseBuilding system={system} onDefenseStartBuild={onDefenseStartBuild} />
              <ExtractorBuilding
                system={system}
                onCancelCollectSystem={onCancelCollectSystem}
                onExtractionStartBuild={onExtractionStartBuild}
                onStartCollectSystem={onStartCollectSystem}
              />
            </>
          )}
        </View>
      </ImageBackground>
      <View></View>
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
