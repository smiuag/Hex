import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { ShipType } from "../../src/types/shipType";
import { formatDuration } from "../../utils/generalUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

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
  disableButton: boolean;
  onBuild: (type: ShipType, amount: number) => void;
  onCancel: (type: ShipType) => void;
};

export const ShipCard: React.FC<Props> = ({ item, disableButton, onBuild, onCancel }) => {
  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
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

            <View style={commonStyles.actionBar}>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => onCancel(item.type)}
                disabled={item.remainingAmount === 0}
              >
                <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>

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

              <TouchableOpacity
                style={[
                  commonStyles.buttonPrimary,
                  (!item.canBuild || disableButton) && commonStyles.buttonDisabled,
                ]}
                disabled={!item.canBuild || disableButton}
                onPress={() => onBuild(item.type, 1)}
              >
                <Text style={commonStyles.buttonTextLight}>{t("build")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
