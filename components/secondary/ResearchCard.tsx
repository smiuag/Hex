import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ResearchType } from "../../src/types/researchTypes";
import { formatDuration } from "../../utils/generalUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

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
    time: string;
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

      // Establece el valor correcto inicial
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
    // detecta transición de inProgress a false con remaining 0
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

    // actualiza el estado anterior
    wasInProgress.current = item.inProgress;
  }, [item.inProgress, remaining]);

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
      <ImageBackground
        source={item.image}
        style={styles.card}
        imageStyle={[
          styles.image,
          !item.inProgress && (!item.isAvailable || !item.hasResources)
            ? styles.unavailableImage
            : null,
        ]}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.level}>
              Nv: {item.currentLevel}/{item.maxLevel}
            </Text>
          </View>

          {item.isMaxed ? null : item.inProgress ? (
            <View style={styles.actionContainer}>
              <Text style={styles.statusText}>
                ⏳ En curso: {formatDuration(remaining)}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => onCancel(item.type)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <ResourceDisplay resources={item.cost} fontSize={13} />
              </View>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.actionContainer}>
                {!item.isAvailable ? (
                  <Text style={styles.lockedText}>
                    🔒 Requiere laboratorio nivel {item.labLevelRequired}
                  </Text>
                ) : !item.hasResources ? (
                  <Text style={styles.warningText}>
                    ⚠️ Recursos insuficientes
                  </Text>
                ) : disableButton ? (
                  <Text style={styles.warningText}>
                    🔕 Otra investigación en curso
                  </Text>
                ) : (
                  <Text style={styles.statusText}>⏱️ {item.time}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.investButton,
                    (disableButton ||
                      !item.isAvailable ||
                      !item.hasResources) &&
                      styles.disabledButton,
                  ]}
                  disabled={
                    disableButton || !item.isAvailable || !item.hasResources
                  }
                  onPress={() => onResearch(item.type)}
                >
                  <Text style={styles.investButtonText}>Investigar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 8,
    alignItems: "center",
  },
  card: {
    height: 180,
    width: width - 24,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  image: {
    resizeMode: "cover",
  },
  unavailableImage: {
    opacity: 0.4,
  },
  overlay: {
    flex: 1,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  level: {
    color: "#ddd",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 13,
  },
  lockedText: {
    color: "#f87171",
    fontSize: 13,
  },
  warningText: {
    color: "#facc15",
    fontSize: 13,
    fontWeight: "600",
  },
  investButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#6b8dc3",
  },
  investButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: "#f87171",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
