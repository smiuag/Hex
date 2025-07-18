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
import { formatDuration, getResearchTime } from "../../utils/buildingUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function ResearchComponent() {
  const { research, labLevel, handleResearch, cancelResearch } =
    useGameContext();

  const researchItems = Object.entries(researchTechnologies)
    .map(([key, config]) => {
      const type = key as ResearchType;
      const data = (research || []).find((r) => r.type.type === type);
      const currentLevel = data?.type.level ?? 0;
      const inProgress = !!data?.progress;
      const remainingTime = inProgress
        ? Math.max(
            0,
            config.baseResearchTime -
              (Date.now() - (data?.progress?.startedAt ?? 0))
          )
        : 0;

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
      };
    })
    .sort((a, b) => a.labLevelRequired - b.labLevelRequired);

  return (
    <FlatList
      data={researchItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.cardContainer}>
          <ImageBackground
            source={item.image}
            style={styles.card}
            imageStyle={[
              styles.image,
              !item.isAvailable && styles.unavailableImage,
            ]}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.level}>
                  Nv: {item.currentLevel}/{item.maxLevel}
                </Text>
              </View>

              {item.isMaxed ? (
                <></>
              ) : item.inProgress ? (
                <View style={styles.actionContainer}>
                  <Text style={styles.statusText}>
                    ⏳ En curso: {formatDuration(item.remainingTime)}
                  </Text>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => cancelResearch()}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              ) : item.isAvailable ? (
                <>
                  <View style={styles.row}>
                    <ResourceDisplay resources={item.baseCost} fontSize={13} />
                  </View>
                  <Text style={styles.description}>{item.description}</Text>
                  <View style={styles.actionContainer}>
                    <Text style={styles.statusText}>⏱️ {item.time}</Text>
                    <TouchableOpacity
                      style={styles.investButton}
                      onPress={() => handleResearch(item.type)}
                    >
                      <Text style={styles.investButtonText}>Investigar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.lockedText}>
                  🔒 Requiere laboratorio nivel {item.labLevelRequired}
                </Text>
              )}
            </View>
          </ImageBackground>
        </View>
      )}
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
  duration: {
    color: "#ccc",
    fontSize: 13,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inProgressText: {
    color: "#facc15",
    fontWeight: "bold",
    marginTop: 6,
  },
  lockedText: {
    color: "#f87171",
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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

  investButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
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
