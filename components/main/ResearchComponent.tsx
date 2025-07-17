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
import {
  Research,
  ResearchData,
  ResearchType,
} from "../../src/types/researchTypes";
import { formatDuration, getResearchTime } from "../../utils/buildingUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

type Props = {
  userResearchData: ResearchData[];
  researchInProgress: Research | null;
  labLevel: number;
  onResearchPress?: (type: ResearchType) => void;
};

export default function ResearchComponent({
  userResearchData = [],
  researchInProgress = null,
  labLevel = 0,
  onResearchPress = () => {},
}: Partial<Props>) {
  const researchItems = Object.entries(researchTechnologies)
    .map(([key, config]) => {
      const type = key as ResearchType;

      const currentLevel =
        userResearchData.find((r) => r.type === type)?.level ?? 0;
      const isAvailable = labLevel >= config.labLevelRequired;
      const inProgress = researchInProgress?.type.type === type;
      const time = formatDuration(getResearchTime(type, currentLevel + 1));

      const remainingTime = inProgress
        ? Math.max(
            0,
            Math.floor(
              config.baseResearchTime -
                (Date.now() / 1000 - researchInProgress.progress!.startedAt)
            )
          )
        : 0;

      return {
        key: type,
        ...config,
        type,
        currentLevel,
        isAvailable,
        inProgress,
        remainingTime,
        time,
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

              <View style={styles.row}>
                <ResourceDisplay resources={item.baseCost} fontSize={13} />
              </View>

              <Text style={styles.description}>{item.description}</Text>

              {item.inProgress ? (
                <Text style={styles.inProgressText}>
                  ⏳ En curso: {item.remainingTime}s restantes
                </Text>
              ) : item.isAvailable ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onResearchPress?.(item.type)}
                >
                  <Text style={styles.buttonText}>
                    Investigar ({item.time})
                  </Text>
                </TouchableOpacity>
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
    padding: 12,
    paddingTop: 40,
  },
  cardContainer: {
    marginBottom: 16,
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
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
