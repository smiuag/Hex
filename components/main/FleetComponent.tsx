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
import { fleetConfig } from "../../src/config/fleetConfig"; // ajusta la ruta según corresponda
import { useGameContext } from "../../src/context/GameContext";
import { FleetType } from "../../src/types/fleetType";
import { isUnlocked } from "../../utils/fleetUtils";
import { formatDuration } from "../../utils/generalUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function FleetComponent() {
  const {
    fleetBuildQueue,
    handleBuildFleet,
    handleCancelFleet,
    resources,
    research,
  } = useGameContext();

  // Convierte la configuración en una lista con estado calculado
  const fleetItems = Object.entries(fleetConfig)
    .map(([key, config]) => {
      const type = key as FleetType;

      // Detectar si la flota está en construcción
      const buildData = fleetBuildQueue.find((b) => b.data.type === type);
      const inProgress = !!buildData?.progress;
      const targetCount = buildData?.progress?.targetAmount ?? 1;
      const totalTime = config.baseBuildTime * targetCount;
      const remainingTime = inProgress
        ? Math.max(
            0,
            totalTime - (Date.now() - (buildData?.progress?.startedAt ?? 0))
          )
        : 0;

      const hasResources = hasEnoughResources(
        resources.resources,
        config.baseCost
      );

      const hasRequiredResearch = isUnlocked(type, research);

      return {
        key: type,
        ...config,
        type,
        inProgress,
        remainingTime,
        hasResources,
        hasRequiredResearch,
        targetCount,
      };
    })
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  const anyInProgress = fleetItems.some((item) => item.inProgress);

  return (
    <FlatList
      data={fleetItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const disableButton = anyInProgress && !item.inProgress;

        return (
          <View style={styles.cardContainer}>
            <ImageBackground
              source={item.imageBackground}
              style={styles.card}
              imageStyle={[
                styles.image,
                (!item.hasRequiredResearch || !item.hasResources) &&
                  styles.unavailableImage,
              ]}
            >
              <View style={styles.overlay}>
                <View style={styles.header}>
                  <Text style={styles.title}>{item.name}</Text>
                </View>

                {item.inProgress ? (
                  <View style={styles.actionContainer}>
                    <Text style={styles.statusText}>
                      ⏳ Construcción en curso:{" "}
                      {formatDuration(item.remainingTime)}
                    </Text>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelFleet(item.type)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.row}>
                      <ResourceDisplay
                        resources={item.baseCost}
                        fontSize={13}
                      />
                    </View>
                    <Text style={styles.description}>{item.description}</Text>

                    <View style={styles.actionContainer}>
                      {!item.hasRequiredResearch ? (
                        <Text style={styles.lockedText}>
                          🔒 Requiere investigación previa
                        </Text>
                      ) : !item.hasResources ? (
                        <Text style={styles.warningText}>
                          ⚠️ Recursos insuficientes
                        </Text>
                      ) : disableButton ? (
                        <Text style={styles.warningText}>
                          🔕 Otra construcción en curso
                        </Text>
                      ) : (
                        <Text style={styles.statusText}>
                          ⏱️ Tiempo base: {formatDuration(item.baseBuildTime)}
                        </Text>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.buildButton,
                          (disableButton ||
                            !item.hasRequiredResearch ||
                            !item.hasResources) &&
                            styles.disabledButton,
                        ]}
                        disabled={
                          disableButton ||
                          !item.hasRequiredResearch ||
                          !item.hasResources
                        }
                        onPress={() => handleBuildFleet(item.type, 1)}
                      >
                        <Text style={styles.buildButtonText}>Construir</Text>
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
  buildButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#6b8dc3",
  },
  buildButtonText: {
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
