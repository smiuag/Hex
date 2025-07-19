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
import { buildingConfig } from "../../src/config/buildingConfig";
import { BuildingType } from "../../src/types/buildingTypes";
import { Research } from "../../src/types/researchTypes";
import { Resources } from "../../src/types/resourceTypes";
import { getBuildTime } from "../../utils/buildingUtils";
import { formatDuration } from "../../utils/formatUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

type Props = {
  research: Research[];
  onBuild: (type: BuildingType) => void;
};

export default function ConstructionComponent({ research, onBuild }: Props) {
  // Función para verificar si un edificio está desbloqueado según las investigaciones requeridas
  const isUnlocked = (
    requiredResearchs: { type: string; level: number }[],
    playerResearch: Research[]
  ) => {
    return requiredResearchs.every((req) => {
      const found = playerResearch.find((r) => r.type.type === req.type);
      return found && found.type.level >= req.level;
    });
  };

  const buildings = Object.entries(buildingConfig).map(([type, config]) => {
    const buildingType = type as BuildingType;
    const cost: Partial<Resources> = config.baseCost;
    const time = getBuildTime(buildingType, 1);
    const available = isUnlocked(config.requiredResearchs, research);

    return {
      type: buildingType,
      name: config.name,
      image: config.imageBackground,
      cost,
      time,
      available,
      description: config.description,
      requirements: config.requiredResearchs,
    };
  });

  return (
    <FlatList
      data={buildings}
      keyExtractor={(item) => item.type}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.cardContainer}>
          <ImageBackground
            source={item.image}
            style={styles.card}
            imageStyle={[
              styles.image,
              !item.available && styles.unavailableImage,
            ]}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                <Text style={styles.title}>{item.name}</Text>
              </View>

              <Text style={styles.description}>{item.description}</Text>

              <ResourceDisplay resources={item.cost} fontSize={13} />

              <View style={styles.actionContainer}>
                <Text style={styles.statusText}>
                  ⏱️ {formatDuration(item.time)}
                </Text>

                {item.available ? (
                  <TouchableOpacity
                    style={styles.buildButton}
                    onPress={() => onBuild(item.type)}
                  >
                    <Text style={styles.buildButtonText}>Construir</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.lockedText}>
                    🔒 Requiere{" "}
                    {item.requirements
                      .map((r) => `${r.type} Nv ${r.level}`)
                      .join(", ")}
                  </Text>
                )}
              </View>
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
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  card: {
    height: 200,
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
  description: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
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
  buildButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buildButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  lockedText: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "65%",
    textAlign: "right",
  },
});
