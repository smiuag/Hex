import { shipConfig } from "@/src/config/shipConfig";
import { SHIP_STATS } from "@/src/constants/ship";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import type { ShipId, ShipType } from "@/src/types/shipType";
import { formatDuration } from "@/utils/generalUtils";
import { getUnmetRequirements, isUnlocked } from "@/utils/shipUtils";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";
import { ShipStatsDisplay } from "../auxiliar/ShipStatsDisplay";

type CardItem = {
  // común
  type: ShipId;
  imageBackground: any;
  owned: number;
  inProgress: boolean;
  remainingAmount: number;
  startedAt: number;
  totalTime: number;
  cost: Record<string, number>;
  canBuild: boolean;
  unitTime: number;

  // flags / extras
  isCustom?: boolean;
  name?: string; // nombre visible para custom

  // stats (presentes en custom)
  attack?: number;
  defense?: number;
  speed?: number;
  hp?: number;

  // requisitos (solo built-in; puede venir del config)
  requiredResearch?: Record<string, number>;
};

type Props = {
  item: CardItem;
  onBuild: (type: ShipId, amount: number) => void;
  onCancel: (type: ShipId) => void;
};

export const ShipCard: React.FC<Props> = ({ item, onBuild, onCancel }) => {
  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
  const { t: tResearch } = useTranslation("research");

  const scale = useRef(new Animated.Value(1)).current;
  const [animate, setAnimate] = useState(false);
  const wasInProgress = useRef(item.inProgress);
  const research = useGameContextSelector((ctx) => ctx.research);

  const isCustom = !!item.isCustom || String(item.type).startsWith("custom:");

  useEffect(() => {
    if (wasInProgress.current && !item.inProgress) setAnimate(true);
    wasInProgress.current = item.inProgress;
  }, [item.inProgress]);

  useEffect(() => {
    if (!animate) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.35, duration: 250, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(() => setAnimate(false));
  }, [animate, scale]);

  // Disponibilidad: built-in según research; custom siempre disponible (ya filtrado por facility)
  const isAvailable = isCustom ? true : isUnlocked(item.type as ShipType, research);

  const unmetRequirements = isCustom
    ? []
    : isAvailable
    ? []
    : getUnmetRequirements(shipConfig[item.type as ShipType].requiredResearch, research);
  // Título / descripción
  const title = isCustom ? item.name ?? t("customShip") : tShip(`shipName.${item.type}`);
  const subtitle = isCustom ? "" : tShip(`shipDescription.${item.type}`);

  // Stats a mostrar
  const stats = isCustom
    ? {
        SPEED: item.speed ?? 0,
        ATTACK: item.attack ?? 0,
        DEFENSE: item.defense ?? 0,
        HP: item.hp ?? 0,
      }
    : {
        SPEED: SHIP_STATS[item.type as ShipType].SPEED,
        ATTACK: SHIP_STATS[item.type as ShipType].ATTACK,
        DEFENSE: SHIP_STATS[item.type as ShipType].DEFENSE,
        HP: SHIP_STATS[item.type as ShipType].HP,
      };

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
              <Text style={commonStyles.titleText}>{title}</Text>
              {item.owned > 0 && <Text style={commonStyles.whiteText}>x{item.owned}</Text>}
            </View>
            {!!subtitle && <Text style={commonStyles.subtitleText}>{subtitle}</Text>}
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
              <ShipStatsDisplay stats={stats} fontSize={13} />
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
                        onlyMostSignificant
                      />
                    </>
                  )}
                </View>
              )}

              {!isAvailable && (
                <View>
                  {unmetRequirements.map((req) => (
                    <Text key={req.researchType} style={commonStyles.errorTextRed}>
                      🔒 {tResearch(`researchName.${req.researchType}`)} {t("level")}{" "}
                      {req.researchLevelRequired}
                    </Text>
                  ))}
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
