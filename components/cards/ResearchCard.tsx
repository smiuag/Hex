import { ResearchRequiredBuilding } from "@/src/types/buildingTypes";
import { Hex } from "@/src/types/hexTypes";
import { hexesMatchesRequeriments } from "@/utils/researchUtils";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { researchConfig } from "../../src/config/researchConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResearchType } from "../../src/types/researchTypes";
import { formatDuration } from "../../utils/generalUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  hexes: Hex[];
  item: {
    type: ResearchType;
    image: any;
    currentLevel: number;
    maxLevel: number;
    isAvailable: boolean;
    isMaxed: boolean;
    inProgress: boolean;
    hasResources: boolean;
    remainingTime: number;
    totalTime: number;
    cost: Record<string, number>;
    progress?: {
      targetLevel: number;
      startedAt: number;
      notificationId?: string;
    };
    requiredBuilding: ResearchRequiredBuilding;
  };
  disableButton: boolean;
  onResearch: (type: ResearchType) => void;
  onCancel: (type: ResearchType) => void;
};

export const ResearchCard: React.FC<Props> = ({
  hexes,
  item,
  disableButton,
  onResearch,
  onCancel,
}) => {
  const { t } = useTranslation("common");
  const { t: tResearch } = useTranslation("research");
  const { t: tBuilding } = useTranslation("buildings");

  const scale = useRef(new Animated.Value(1)).current;
  const [animate, setAnimate] = useState(false);
  const wasInProgress = useRef(item.inProgress);

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

  const config = researchConfig[item.type];
  const requirements = config.requiredBuilding;

  return (
    <Animated.View style={[commonStyles.containerCenter, { transform: [{ scale }] }]}>
      <ImageBackground
        source={item.image}
        style={commonStyles.card}
        imageStyle={[
          commonStyles.imageCover,
          !item.inProgress && (!item.isAvailable || !item.hasResources)
            ? commonStyles.imageUnavailable
            : null,
        ]}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <View style={commonStyles.headerRow}>
              <Text style={commonStyles.titleText}>{tResearch(`researchName.${item.type}`)}</Text>
              <Text style={commonStyles.subtitleText}>
                {t("level")}: {item.currentLevel}/{item.maxLevel}
              </Text>
            </View>
            <Text style={commonStyles.descriptionText}>
              {tResearch(`researchDescription.${item.type}`)}
            </Text>
          </View>

          {item.isMaxed ? null : item.inProgress ? (
            <View>
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>{t("cost")}</Text>
                <View style={commonStyles.rowResources}>
                  <ResourceDisplay resources={item.cost} fontSize={13} />
                </View>
              </View>

              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>{t("totalTime")}</Text>
                <Text style={commonStyles.whiteText}>{formatDuration(item.totalTime)}</Text>
              </View>
              <View style={commonStyles.actionBar}>
                <Text style={commonStyles.statusTextYellow}>
                  ⏳ {t("inProgress")}:{" "}
                  <CountdownTimer
                    startedAt={item.progress?.startedAt}
                    duration={item.totalTime}
                    onComplete={() => setAnimate(true)}
                  />
                </Text>
                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => onCancel(item.type)}
                >
                  <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>{t("cost")}</Text>
                <View style={commonStyles.rowResources}>
                  <ResourceDisplay resources={item.cost} fontSize={13} />
                </View>
              </View>
              <View style={commonStyles.actionBar}>
                {!item.isAvailable ? (
                  <View>
                    {Object.values(
                      requirements
                        .filter((req) => req.researchLevel <= 1)
                        .reduce((acc, req) => {
                          const existing = acc[req.buildingType];
                          if (!existing || req.researchLevel > existing.buildingLevelRequired) {
                            acc[req.buildingType] = req;
                          }
                          return acc;
                        }, {} as Record<string, (typeof requirements)[0]>)
                    )
                      .filter((req) => {
                        return !hexesMatchesRequeriments(hexes, req);
                      })
                      .map((r, i) => (
                        <Text key={i} style={commonStyles.errorTextRed}>
                          🔒 {tBuilding(`buildingName.${r.buildingType}`)} {t("level")}{" "}
                          {r.buildingLevelRequired}
                        </Text>
                      ))}
                  </View>
                ) : !item.hasResources ? (
                  <Text style={commonStyles.warningTextYellow}>⚠️ {t("notEnoughResources")}</Text>
                ) : disableButton ? (
                  <Text style={commonStyles.warningTextYellow}>
                    🔕 {t("anotherResearchOngoing")}
                  </Text>
                ) : (
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {formatDuration(item.totalTime)}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    commonStyles.buttonPrimary,
                    (disableButton || !item.isAvailable || !item.hasResources) &&
                      commonStyles.buttonDisabled,
                  ]}
                  disabled={disableButton || !item.isAvailable || !item.hasResources}
                  onPress={() => onResearch(item.type)}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("research")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
