import { useGameContext } from "@/src/context/GameContext";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { shipConfig } from "../../src/config/shipConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";
import { StarSystem } from "../../src/types/starSystemTypes";
import { CountdownTimer } from "../auxiliar/CountdownTimer";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onCancelAttack: (id: string) => void;
};

export const SystemDefendedCard: React.FC<Props> = ({ system, onDiscard, onCancelAttack }) => {
  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
  const { t: tPlanets } = useTranslation("planets");

  const { fleet } = useGameContext();

  const router = useRouter();
  const duration = system.attackFleetId
    ? (() => {
        const f = fleet.find((f) => f.id === system.attackFleetId);
        if (!f) return 0;
        return f.endTime - f.startTime;
      })()
    : 0;

  console.log(duration);

  return (
    <View style={{ flex: 1, height: "100%" }}>
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
            <View>
              <Text style={commonStyles.whiteText}>
                {t("CelestialBodys")} {system.planets.length}
              </Text>
            </View>
            {system.defense.map((ship) => {
              const config = shipConfig[ship.type as ShipType];
              const name = tShip(`shipName.${ship.type}`);
              return (
                <Text
                  key={ship.type}
                  style={[commonStyles.subtitleText, { fontSize: 12, marginVertical: 1 }]}
                >
                  {ship.amount} {name} (at:{config.attack} de:{config.defense} vel:{config.speed})
                </Text>
              );
            })}
            {system.attackFleetId ? (
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.statusTextYellow}>
                  ⏳ {t("inProgress")}:{" "}
                  <CountdownTimer startedAt={system.starPortStartedAt} duration={duration} />
                </Text>

                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => onCancelAttack(system.id)}
                >
                  <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={commonStyles.rowSpaceBetween}>
                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => onDiscard(system.id)}
                >
                  <Text style={commonStyles.cancelButtonText}>{t("Discard")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={commonStyles.buttonPrimary}
                  onPress={() => {
                    router.replace(`/galaxy/fleetAttack?systemId=${system.id}`);
                  }}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("Attack")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};
