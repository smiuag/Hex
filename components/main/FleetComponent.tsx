import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fleetConfig } from "../../src/config/fleetConfig";
import { useGameContext } from "../../src/context/GameContext";
import { FleetType } from "../../src/types/fleetType";
import { formatDuration } from "../../utils/generalUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function FleetComponent() {
  const [queuedAmounts, setQueuedAmounts] = useState<
    Partial<Record<FleetType, number>>
  >({});

  const delayRef = useRef(300);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { fleetBuildQueue, handleBuildFleet, handleCancelFleet, resources } =
    useGameContext();

  const adjustQueue = (type: FleetType, direction: "add" | "remove") => {
    setQueuedAmounts((prev) => {
      const current = prev[type] ?? 0;
      if (direction === "add") {
        handleBuildFleet(type, 1);
        return { ...prev, [type]: current + 1 };
      } else if (direction === "remove" && current > 0) {
        handleCancelFleet(type);
        return { ...prev, [type]: current - 1 };
      }
      return prev;
    });
  };

  const startLoop = (type: FleetType, direction: "add" | "remove") => {
    delayRef.current = 300;

    const loop = () => {
      adjustQueue(type, direction);
      delayRef.current = Math.max(30, delayRef.current * 0.4);
      loopRef.current = setTimeout(loop, delayRef.current);
    };

    loop();
  };

  const stopLoop = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
    loopRef.current = null;
  };

  const handleLongPress =
    (type: FleetType, direction: "add" | "remove") => () => {
      startLoop(type, direction);
    };

  const handlePressOut = () => {
    stopLoop();
  };

  const fleetItems = Object.entries(fleetConfig)
    .map(([key, config]) => {
      const type = key as FleetType;
      const owned =
        fleetBuildQueue.find((f) => f.data.type === type)?.data.amount ?? 0;

      const inQueue = queuedAmounts[type] ?? 0;
      const totalCost = config.baseCost;
      const totalTime = config.baseBuildTime * inQueue;

      return {
        key: type,
        ...config,
        type,
        inQueue,
        owned,
        totalCost,
        totalTime,
        canBuild: hasEnoughResources(resources, config.baseCost),
      };
    })
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <FlatList
      data={fleetItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.cardContainer}>
          <ImageBackground
            source={item.imageBackground}
            style={styles.card}
            imageStyle={[
              styles.image,
              !item.canBuild && styles.unavailableImage,
            ]}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {item.name}{" "}
                  <Text style={styles.timeUnit}>
                    ({formatDuration(item.baseBuildTime)})
                  </Text>
                </Text>
                {item.owned > 0 && (
                  <Text style={styles.owned}>{item.owned}</Text>
                )}
              </View>

              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.row}>
                <ResourceDisplay resources={item.totalCost} fontSize={13} />
              </View>

              <Text style={styles.statusText}>
                ⏱️ Tiempo estimado: {formatDuration(item.totalTime)}
              </Text>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => adjustQueue(item.type, "remove")}
                  onLongPress={handleLongPress(item.type, "remove")}
                  onPressOut={handlePressOut}
                  disabled={item.inQueue === 0}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <View style={styles.queueCountContainer}>
                  {item.inQueue > 0 && (
                    <>
                      <Text style={styles.queueLabel}>En cola</Text>
                      <Text style={styles.queueCount}>{item.inQueue}</Text>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.buildButton,
                    !item.canBuild && styles.disabledButton,
                  ]}
                  onPress={() => adjustQueue(item.type, "add")}
                  onLongPress={handleLongPress(item.type, "add")}
                  onPressOut={handlePressOut}
                  disabled={!item.canBuild}
                >
                  <Text style={styles.buttonText}>Construir</Text>
                </TouchableOpacity>
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
    paddingTop: 30,
  },
  cardContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  card: {
    width: width - 20,
    minHeight: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  unavailableImage: {
    opacity: 0.3,
  },
  overlay: {
    flex: 1,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  owned: {
    color: "#ccc",
    fontWeight: "bold",
    fontSize: 14,
  },
  description: {
    color: "#ddd",
    marginBottom: 6,
    fontSize: 13,
  },
  row: {
    marginBottom: 4,
  },
  statusText: {
    color: "#facc15",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  timeUnit: {
    fontWeight: "normal",
    fontSize: 11,
    color: "#e2e8f0",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#f87171",
    padding: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginRight: 6,
  },
  buildButton: {
    backgroundColor: "#3b82f6",
    padding: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  queueCountContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  queueLabel: {
    color: "#ccc",
    fontSize: 11,
    marginBottom: 2,
  },
  queueCount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
