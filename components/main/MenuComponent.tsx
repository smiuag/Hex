import { ResearchType } from "@/src/types/researchTypes";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IMAGES } from "../../src/constants/images";
import { useGameContext } from "../../src/context/GameContext";
import {
  deleteMap,
  deleteResearch,
  loadMap,
  saveMap,
  saveResources,
} from "../../src/services/storage";
import { BuildingType } from "../../src/types/buildingTypes";
import { Process } from "../../src/types/processTypes";
import { formatDuration } from "../../utils/generalUtils";
import { generateHexGrid, getInitialResources } from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";
import {
  getBuildingProcesses,
  getResearchProcesses,
} from "../../utils/processUtils";

export default function MenuComponent() {
  const [checking, setChecking] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const {
    setHexes,
    resetResources,
    resetResearch,
    handleCancelBuild,
    handleCancelResearch,
    hexes,
    research,
    resetQuests,
  } = useGameContext();

  useEffect(() => {
    const buildingProcesses = getBuildingProcesses(hexes);
    const researchProcesses = getResearchProcesses(research);
    const allProcesses = [...buildingProcesses, ...researchProcesses];
    setProcesses(allProcesses);
  }, [hexes, research]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMap = async () => {
      const savedMap = await loadMap();
      setHasMap(!!savedMap?.length);
      setChecking(false);
    };
    checkMap();
  }, []);

  const handleStartGame = async () => {
    const newMap = generateHexGrid(2).map((hex) => {
      const isBase = hex.q === 0 && hex.r === 0;
      const terrain = isBase ? ("base" as any) : ("initial" as any);

      return {
        ...hex,
        terrain,
        building: isBase ? { type: "BASE" as BuildingType, level: 1 } : null,
        construction: undefined,
        previousBuilding: null,
      };
    });

    await saveMap(newMap);
    await saveResources(getInitialResources());
    await NotificationManager.cancelAllNotifications();
    await deleteResearch();
    resetResearch();
    resetQuests();
    setHexes(newMap);
    resetResources();
    setHasMap(true);
  };

  const handleReset = () => {
    Alert.alert(
      "Finalizar partida",
      "¿Estás seguro de que quieres borrar el mapa actual?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, borrar",
          style: "destructive",
          onPress: async () => {
            await deleteMap();
            await saveResources(getInitialResources());
            await NotificationManager.cancelAllNotifications();
            await deleteResearch();
            resetResearch();
            resetQuests();

            setHexes([]);
            resetResources();
            setHasMap(false);
          },
        },
      ]
    );
  };

  const cancelBuild = async (q: number, r: number) => {
    await handleCancelBuild(q, r);
    // Opcional: refrescar lista procesos después de cancelar
    const updatedProcesses = getBuildingProcesses(hexes);
    setProcesses(updatedProcesses);
  };

  const cancelResearch = async (type: ResearchType) => {
    await handleCancelResearch(type);
    const updatedProcesses = getBuildingProcesses(hexes);
    setProcesses(updatedProcesses);
  };

  const cancelShip = async () => {};

  const renderProcess = ({ item }: { item: Process }) => {
    const elapsed = Date.now() - item.startedAt;
    const timeRemaining = Math.max(0, item.duration - elapsed);

    return (
      <View style={styles.processCard}>
        <Text style={styles.processName}>{item.name}</Text>
        <Text style={styles.processTime}>
          ⏳ {formatDuration(timeRemaining)}
        </Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={async () => {
            if (item.type === "BUILDING") {
              await cancelBuild(item.q!, item.r!);
            } else if (item.type === "RESEARCH") {
              await cancelResearch(item.researchType!);
            } else if (item.type === "SHIP") {
              await cancelShip();
            }
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={IMAGES.BACKGROUND_MENU_IMAGE}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={styles.title}>Colonia</Text>

          {hasMap && (
            <>
              {processes.length === 0 ? (
                <Text style={styles.emptyText}>No hay procesos activos.</Text>
              ) : (
                <FlatList
                  data={processes}
                  keyExtractor={(item) => item.id}
                  renderItem={renderProcess}
                  contentContainerStyle={{ paddingBottom: 12 }}
                  style={styles.list}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!hasMap && (
            <Button title="Iniciar partida" onPress={handleStartGame} />
          )}
          {hasMap && (
            <Button
              title="Finalizar partida"
              color="red"
              onPress={handleReset}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "space-between",
  },
  topContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  buttonContainer: {},
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#fff", // para que contraste en fondo oscuro
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  section: {
    backgroundColor: "rgba(0, 0, 0, 0.6)", // fondo negro semitransparente
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8, // para Android shadow
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  emptyText: {
    color: "#ccc",
    fontStyle: "italic",
  },

  processCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.85)", // más oscuro y semitransparente
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 6,
  },
  processName: {
    flex: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  processTime: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 12,
  },
  cancelButton: {
    backgroundColor: "#e53935",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: "#700000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
