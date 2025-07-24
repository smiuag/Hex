import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResearchType } from "../../src/types/researchTypes";
import { formatDuration } from "../../utils/generalUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

type Props = {
  item: {
    type: ResearchType;
    name: string;
    description: string;
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
    labLevelRequired: number;
    progress?: {
      targetLevel: number;
      startedAt: number;
      notificationId?: string;
    };
  };
  disableButton: boolean;
  onResearch: (type: ResearchType) => void;
  onCancel: (type: ResearchType) => void;
};

export const ResearchCard: React.FC<Props> = ({
  item,
  disableButton,
  onResearch,
  onCancel,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [remaining, setRemaining] = useState(item.totalTime);
  const intervalRef = useRef<number | null>(null);
  const wasInProgress = useRef(item.inProgress);

  useEffect(() => {
    if (item.inProgress && item.progress) {
      const { startedAt } = item.progress;
      const totalTime = item.totalTime;

      const elapsed = Date.now() - startedAt;
      const initialRemaining = Math.max(0, totalTime - elapsed);
      setRemaining(initialRemaining);

      intervalRef.current = setInterval(() => {
        const elapsedNow = Date.now() - startedAt;
        const newRemaining = Math.max(0, totalTime - elapsedNow);
        setRemaining(newRemaining);
      }, 1000);
    } else {
      setRemaining(item.totalTime);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [item.inProgress, item.progress?.startedAt, item.totalTime]);

  useEffect(() => {
    if (wasInProgress.current && !item.inProgress && remaining <= 0) {
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
      ]).start();
    }
    wasInProgress.current = item.inProgress;
  }, [item.inProgress, remaining]);

  return (
    <Animated.View
      style={[commonStyles.containerCenter, { transform: [{ scale }] }]}
    >
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
              <Text style={commonStyles.titleText}>{item.name}</Text>
              <Text style={commonStyles.subtitleText}>
                Nv: {item.currentLevel}/{item.maxLevel}
              </Text>
            </View>
            <Text style={commonStyles.descriptionText}>{item.description}</Text>
          </View>

          {item.isMaxed ? null : item.inProgress ? (
            <View style={commonStyles.actionBar}>
              <Text style={commonStyles.statusTextYellow}>
                ⏳ En curso: {formatDuration(remaining)}
              </Text>
              <TouchableOpacity
                style={commonStyles.buttonDanger}
                onPress={() => onCancel(item.type)}
              >
                <Text style={commonStyles.buttonTextLight}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <ResourceDisplay resources={item.cost} fontSize={13} />

              <View style={commonStyles.actionBar}>
                {!item.isAvailable ? (
                  <Text style={commonStyles.errorTextRed}>
                    🔒 Laboratorio nivel {item.labLevelRequired}
                  </Text>
                ) : !item.hasResources ? (
                  <Text style={commonStyles.warningTextYellow}>
                    ⚠️ Recursos insuficientes
                  </Text>
                ) : disableButton ? (
                  <Text style={commonStyles.warningTextYellow}>
                    🔕 Otra investigación en curso
                  </Text>
                ) : (
                  <Text style={commonStyles.statusTextYellow}>
                    ⏱️ {formatDuration(item.totalTime)}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    commonStyles.buttonPrimary,
                    (disableButton ||
                      !item.isAvailable ||
                      !item.hasResources) &&
                      commonStyles.buttonDisabled,
                  ]}
                  disabled={
                    disableButton || !item.isAvailable || !item.hasResources
                  }
                  onPress={() => onResearch(item.type)}
                >
                  <Text style={commonStyles.buttonTextLight}>Investigar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
