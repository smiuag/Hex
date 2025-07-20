import { useLocalSearchParams, useRouter } from "expo-router";
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
import ResourceBar from "../../../components/secondary/ResourceBar";
import { ResourceDisplay } from "../../../components/secondary/ResourceDisplay";
import { buildingConfig } from "../../../src/config/buildingConfig";
import { useGameContext } from "../../../src/context/GameContext";
import { BuildingType } from "../../../src/types/buildingTypes";
import { Resources } from "../../../src/types/resourceTypes";
import {
  getBuildTime,
  isAtMaxCount,
  isUnlocked,
} from "../../../utils/buildingUtils";
import { formatDuration } from "../../../utils/generalUtils";
import { hasEnoughResources } from "../../../utils/resourceUtils";

const { width } = Dimensions.get("window");

export default function ConstructionComponent() {
  const { q, r } = useLocalSearchParams();
  const { research, resources, hexes, handleBuild } = useGameContext();
  const router = useRouter();

  const onBuild = async (type: BuildingType) => {
    const qNum = parseInt(q as string, 10);
    const rNum = parseInt(r as string, 10);
    await handleBuild(qNum, rNum, type);
    router.replace("/(tabs)/planet");
  };

  const handleCancel = () => {
    router.replace("/(tabs)/planet");
  };

  const buildings = Object.entries(buildingConfig)
    .map(([type, config]) => {
      const buildingType = type as BuildingType;
      const cost: Partial<Resources> = config.baseCost;
      const time = getBuildTime(buildingType, 1);
      const lockedByMax = isAtMaxCount(buildingType, hexes);
      const unlockedByResearch = isUnlocked(buildingType, 1, research);
      const available = unlockedByResearch && !lockedByMax;
      const lockedByResources = !hasEnoughResources(resources.resources, cost);

      return {
        type: buildingType,
        name: config.name,
        image: config.imageBackground,
        cost,
        time,
        available,
        lockedByMax,
        unlockedByResearch,
        description: config.description,
        requirements: config.requiredResearch,
        lockedByResources,
      };
    })
    .sort((a, b) => {
      // Prioridad: disponibles (0), luego bloqueados por investigación (1), luego al máximo (2)
      const getPriority = (building: typeof a) => {
        if (building.lockedByMax) return 3;
        if (!building.unlockedByResearch) return 2;
        if (building.lockedByResources) return 1;
        if (building.available) return 0;
        return 3; // fallback
      };

      return getPriority(a) - getPriority(b);
    });

  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Botón flotante de cerrar */}
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <FlatList
          data={buildings}
          keyExtractor={(item) => item.type}
          contentContainerStyle={styles.list}
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          )}
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

                  {!item.lockedByMax && (
                    <ResourceDisplay resources={item.cost} fontSize={13} />
                  )}

                  <View style={styles.actionContainer}>
                    {!item.lockedByMax && !item.lockedByResources && (
                      <Text style={styles.statusText}>
                        ⏱️ {formatDuration(item.time)}
                      </Text>
                    )}
                    {!item.lockedByMax && item.lockedByResources && (
                      <Text style={styles.statusText}>
                        ⚠️ Recursos insuficientes
                      </Text>
                    )}

                    {item.available ? (
                      <TouchableOpacity
                        style={[
                          styles.buildButton,
                          item.lockedByResources && styles.disabledButton,
                        ]}
                        onPress={() => onBuild(item.type)}
                        disabled={item.lockedByResources}
                      >
                        <Text style={styles.buildButtonText}>Construir</Text>
                      </TouchableOpacity>
                    ) : item.lockedByMax ? (
                      <Text style={styles.lockedText}>🔒 Límite alcanzado</Text>
                    ) : (
                      <Text style={styles.lockedText}>
                        🔒 Requiere{" "}
                        {item.requirements
                          .map(
                            (r) =>
                              `${r.researchType} Nv ${r.researchLevelRequired}`
                          )
                          .join(", ")}
                      </Text>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}
        />
      </View>
      <ResourceBar />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 35,
    paddingBottom: 40, // espacio extra para el botón final
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    padding: 12,
    zIndex: 10,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#e53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: width - 48, // de lado a lado con margen
    marginBottom: 16, // menos espacio debajo
  },

  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#6b8dc3", // azul apagado para deshabilitado
  },
});
