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
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

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
  const [animate, setAnimate] = useState(false);
  const wasInProgress = useRef(item.inProgress);

  // Detectar cuando termina la investigación y disparar animación
  useEffect(() => {
    if (wasInProgress.current && !item.inProgress) {
      // Si quieres, aquí podrías controlar también si remaining es 0
      // pero ahora lo hace CountdownTimer y llama onComplete
    }
    wasInProgress.current = item.inProgress;
  }, [item.inProgress]);

  // Animación al activar `animate`
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
            <View>
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>Coste</Text>
                <View style={commonStyles.rowResources}>
                  <ResourceDisplay resources={item.cost} fontSize={13} />
                </View>
              </View>

              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>Tiempo total</Text>
                <View>
                  <Text style={commonStyles.whiteText}>
                    {formatDuration(item.totalTime)}
                  </Text>
                </View>
              </View>
              <View style={commonStyles.actionBar}>
                <Text style={commonStyles.statusTextYellow}>
                  ⏳ En curso:
                  <CountdownTimer
                    startedAt={item.progress?.startedAt}
                    duration={item.totalTime}
                    onComplete={() => setAnimate(true)}
                  />
                </Text>
                <TouchableOpacity
                  style={commonStyles.buttonDanger}
                  onPress={() => onCancel(item.type)}
                >
                  <Text style={commonStyles.buttonTextLight}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.whiteText}>Coste</Text>
                <View style={commonStyles.rowResources}>
                  <ResourceDisplay resources={item.cost} fontSize={13} />
                </View>
              </View>
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
