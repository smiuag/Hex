import React from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { researchTechnologies } from "../../src/config/researchConfig";
import { useGameContext } from "../../src/context/GameContext";
import { ResearchType } from "../../src/types/researchTypes";
import { formatDuration } from "../../utils/generalUtils";
import { getResearchCost, getResearchTime } from "../../utils/researchUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function ResearchComponent() {
  const {
    research,
    labLevel,
    resources,
    handleResearch,
    handleCancelResearch,
  } = useGameContext();

  const researchItems = Object.entries(researchTechnologies)
    .map(([key, config]) => {
      const type = key as ResearchType;
      const data = (research || []).find((r) => r.data.type === type);
      const currentLevel = data?.data.level ?? 0;
      const inProgress = !!data?.progress;
      const targetLevel = data?.progress?.targetLevel ?? currentLevel + 1;
      const totalTime = getResearchTime(type, targetLevel);
      const remainingTime = inProgress
        ? Math.max(
            0,
            totalTime - (Date.now() - (data?.progress?.startedAt ?? 0))
          )
        : 0;

      const scaledCost = getResearchCost(type, targetLevel);
      const hasResources = hasEnoughResources(resources.resources, scaledCost);
      const isAvailable = labLevel >= config.labLevelRequired;
      const time = formatDuration(getResearchTime(type, currentLevel + 1));
      const isMaxed = currentLevel >= config.maxLevel;

      return {
        key: type,
        ...config,
        type,
        currentLevel,
        isAvailable,
        inProgress,
        remainingTime,
        time,
        isMaxed,
        hasResources,
        cost: scaledCost,
      };
    })
    .sort((a, b) => {
      // maxeadas al final (abajo)
      if (a.isMaxed && !b.isMaxed) return 1;
      if (!a.isMaxed && b.isMaxed) return -1;

      // luego bloqueadas por lab (antes de maxeadas)
      if (!a.isAvailable && b.isAvailable) return 1;
      if (a.isAvailable && !b.isAvailable) return -1;

      // luego sin recursos (antes que bloqueadas)
      if (!a.hasResources && b.hasResources) return 1;
      if (a.hasResources && !b.hasResources) return -1;

      // finalmente orden normal ascendente por labLevelRequired
      return a.labLevelRequired - b.labLevelRequired;
    });

  const anyInProgress = researchItems.some((item) => item.inProgress);

  return (
    <FlatList
      data={researchItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isCurrentInProgress = item.inProgress;
        const disableButton = anyInProgress && !isCurrentInProgress;

        return (
          <View style={styles.cardContainer}>
            <ImageBackground
              source={item.image}
              style={styles.card}
              imageStyle={[
                styles.image,
                (!item.isAvailable || !item.hasResources) &&
                  styles.unavailableImage,
              ]}
            >
              <View style={styles.overlay}>
                <View style={styles.header}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.level}>
                    Nv: {item.currentLevel}/{item.maxLevel}
                  </Text>
                </View>

                {item.isMaxed ? null : isCurrentInProgress ? (
                  <View style={styles.actionContainer}>
                    <Text style={styles.statusText}>
                      ⏳ En curso: {formatDuration(item.remainingTime)}
                    </Text>
                    <TouchableOpacity
                      style={styles.cancelButton} // Siempre activo, sin atenuar
                      onPress={() => handleCancelResearch(item.type)}
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
                          disableButton ||
                          !item.isAvailable ||
                          !item.hasResources
                        }
                        onPress={() => handleResearch(item.type)}
                      >
                        <Text style={styles.investButtonText}>Investigar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </ImageBackground>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 35,
    textAlign: "center",
  },
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
    color: "#facc15", // amarillo
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
    backgroundColor: "#6b8dc3", // azul apagado para deshabilitado
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
