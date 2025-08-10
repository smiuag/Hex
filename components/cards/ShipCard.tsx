import { shipConfig } from "@/src/config/shipConfig";
import { SHIP_STATS } from "@/src/constants/ship";
import { useGameContextSelector } from "@/src/context/GameContext";
import { getUnmetRequirements, isUnlocked } from "@/utils/shipUtils";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";
import { formatDuration } from "../../utils/generalUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";
import { ShipStatsDisplay } from "../auxiliar/ShipStatsDisplay";

type Props = {
  item: {
    type: ShipType;
    imageBackground: any;
    owned: number;
    inProgress: boolean;
    remainingAmount: number;
    startedAt: number;
    totalTime: number;
    cost: Record<string, number>;
    canBuild: boolean;
    unitTime: number;
  };
  onBuild: (type: ShipType, amount: number) => void;
  onCancel: (type: ShipType) => void;
};

export const ShipCard: React.FC<Props> = ({ item, onBuild, onCancel }) => {
  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
  const { t: tResearch } = useTranslation("research");
  const scale = useRef(new Animated.Value(1)).current;
  const [animate, setAnimate] = useState(false);
  const wasInProgress = useRef(item.inProgress);
  const research = useGameContextSelector((ctx) => ctx.research);

  useEffect(() => {
    if (wasInProgress.current && !item.inProgress) {
      setAnimate(true);
    }
    wasInProgress.current = item.inProgress;
  }, [item.inProgress]);

  useEffect(() => {
    if (animate) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start(() => setAnimate(false));
    }
  }, [animate, scale]);

  const isAvailable = isUnlocked(item.type, research);

  const config = shipConfig[item.type];
  const unmetRequirements = isAvailable
    ? []
    : getUnmetRequirements(config.requiredResearch, research);

  return (
    <Animated.View style={[commonStyles.cardContainer, { transform: [{ scale }] }]}>
      <ImageBackground
        source={item.imageBackground}
        style={commonStyles.card}
        imageStyle={
          !item.inProgress && !item.canBuild
            ? commonStyles.imageUnavailable
            : commonStyles.imageCover
        }
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <View style={commonStyles.headerRow}>
              <Text style={commonStyles.titleText}>{tShip(`shipName.${item.type}`)}</Text>
              {item.owned > 0 && <Text style={commonStyles.whiteText}>x{item.owned}</Text>}
            </View>
            <Text style={commonStyles.subtitleText}>{tShip(`shipDescription.${item.type}`)}</Text>
          </View>
          <View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>{t("cost")}</Text>
              <View style={commonStyles.rowResources}>
                <ResourceDisplay resources={item.cost} fontSize={13} />
              </View>
            </View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>{t("timePerUnit")}</Text>
              <Text style={commonStyles.whiteText}>{formatDuration(item.unitTime)}</Text>
            </View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>{t("combatStats")} </Text>
              <ShipStatsDisplay
                stats={{
                  SPEED: SHIP_STATS[item.type].SPEED,
                  ATTACK: SHIP_STATS[item.type].ATTACK,
                  DEFENSE: SHIP_STATS[item.type].DEFENSE,
                  HP: SHIP_STATS[item.type].HP,
                }}
                fontSize={13}
              />
            </View>

            <View style={commonStyles.actionBar}>
              {isAvailable && (
                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => onCancel(item.type)}
                  disabled={item.remainingAmount === 0}
                >
                  <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
                </TouchableOpacity>
              )}
              {isAvailable && (
                <View style={commonStyles.queueCountContainer}>
                  {item.remainingAmount > 0 && (
                    <>
                      <Text style={[commonStyles.queueCount]}>{item.remainingAmount} / </Text>
                      <Text style={{ marginRight: 4 }}>⏳</Text>
                      <CountdownTimer
                        startedAt={item.startedAt}
                        duration={item.totalTime}
                        onlyMostSignificant={true}
                      />
                    </>
                  )}
                </View>
              )}

              {!isAvailable && (
                <View>
                  {Object.values(
                    unmetRequirements.map((item, i) => (
                      <Text key={item.researchType} style={commonStyles.errorTextRed}>
                        🔒 {tResearch(`researchName.${item.researchType}`)} {t("level")}{" "}
                        {item.researchLevelRequired}
                      </Text>
                    ))
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  commonStyles.buttonPrimary,
                  (!item.canBuild || !isAvailable) && commonStyles.buttonDisabled,
                ]}
                disabled={!item.canBuild || !isAvailable}
                onPress={() => onBuild(item.type, 1)}
              >
                <Text style={commonStyles.buttonTextLight}>{t("Build")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
