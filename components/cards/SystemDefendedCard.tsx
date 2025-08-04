import { useGameContextSelector } from "@/src/context/GameContext";
import { getSystemImage } from "@/utils/starSystemUtils";
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
  const fleet = useGameContextSelector((ctx) => ctx.fleet);
  const universe = useGameContextSelector((ctx) => ctx.universe);
  const router = useRouter();

  const duration = system.attackFleetId
    ? (() => {
        const f = fleet.find((f) => f.id === system.attackFleetId);
        if (!f) return 0;
        return f.endTime - f.startTime;
      })()
    : 0;

  const image = getSystemImage(system.type);
  const systemName = universe[system.id].name;

  return (
    <View style={commonStyles.containerCenter} key={system.id}>
      <ImageBackground
        source={image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <Text style={commonStyles.titleBlueText}>
            {systemName}{" "}
            <Text style={[commonStyles.whiteText, { fontSize: 16 }]}>
              {" "}
              ({tPlanets(`systemType.${system.type}`)}){" "}
            </Text>
          </Text>
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
            <View style={commonStyles.actionBar}>
              <Text style={commonStyles.statusTextYellow}>
                ⏳ {t("inProgress")}:{" "}
                <CountdownTimer startedAt={system.attackStartedAt} duration={duration} />
              </Text>

              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => onCancelAttack(system.id)}
              >
                <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={commonStyles.actionBar}>
              <Text style={commonStyles.whiteText}>
                {system.distance} {t("parsecs")}
              </Text>

              <TouchableOpacity
                style={commonStyles.buttonPrimary}
                onPress={() => {
                  router.replace(`/(tabs)/galaxy/fleetAttack?systemId=${system.id}`);
                }}
              >
                <Text style={commonStyles.buttonTextLight}>{t("Attack")}</Text>
              </TouchableOpacity>
            </View>
          )}
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
