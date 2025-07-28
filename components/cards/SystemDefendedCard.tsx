import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { shipConfig } from "../../src/config/shipConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";
import { StarSystem } from "../../src/types/starSystemTypes";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onAttack: (id: string) => void;
};

export const SystemDefendedCard: React.FC<Props> = ({ system, onDiscard, onAttack }) => {
  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
  const { t: tPlanets } = useTranslation("planets");
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
              onPress={() => onAttack(system.id)}
            >
              <Text style={commonStyles.buttonTextLight}>{t("Attack")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
