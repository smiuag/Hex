import { raceConfig } from "@/src/config/raceConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { ShipType } from "@/src/types/shipType";
import { getSpecByType, isCustomType } from "@/utils/shipUtils";
import { getSystemImage } from "@/utils/starSystemUtils";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ShipStatsDisplay } from "../auxiliar/ShipStatsDisplay";

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
  const specs = useGameContextSelector((ctx) => ctx.specs);
  const router = useRouter();

  const attackingFleet = fleet.find(
    (f) => f.destinationSystemId === system.id && f.movementType == "ATTACK"
  );
  const duration = attackingFleet ? attackingFleet.endTime - attackingFleet.startTime : 0;

  const image = getSystemImage(system.type);
  const systemName = universe[system.id].name;
  const emblem = system && system.race ? raceConfig[system.race].emblem : IMAGES.RACE_DEFAULT;

  return (
    <View style={commonStyles.containerCenter} key={system.id}>
      <ImageBackground
        source={image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={emblem} style={styles.emblem} resizeMode="contain" />

            <View style={{ marginLeft: 10 }}>
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
          </View>
          <View style={{ marginTop: 5 }}>
            {system.defense.map((ship) => {
              const spec = getSpecByType(ship.type, specs);
              const displayName = isCustomType(ship.type)
                ? spec.name
                : tShip(`shipName.${ship.type as ShipType}`);

              return (
                <View style={[commonStyles.rowSpaceBetween, { marginTop: 3 }]} key={ship.type}>
                  <Text
                    key={ship.type}
                    style={[commonStyles.subtitleText, { fontSize: 12, marginVertical: 1 }]}
                  >
                    {ship.amount} {displayName}
                  </Text>
                  <ShipStatsDisplay
                    stats={{
                      speed: spec.speed,
                      attack: spec.attack,
                      defense: spec.defense,
                      hp: spec.hp,
                    }}
                    showNonCombat={false}
                    fontSize={13}
                  />
                </View>
              );
            })}
          </View>
          {attackingFleet ? (
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
              <View></View>

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

const styles = StyleSheet.create({
  emblem: { width: 36, height: 36, borderRadius: 8 },
});
