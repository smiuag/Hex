import { ResearchType } from "@/src/types/researchTypes";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ResourceDisplay } from "../../components/secondary/ResourceDisplay";
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
import { getTotalProductionPerHour } from "../../utils/buildingUtils";
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
  } = useGameContext();

  useEffect(() => {
    console.log(research);
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

  const productionTotal = useMemo(
    () => getTotalProductionPerHour(hexes),
    [hexes]
  );

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
    <View style={styles.container}>
      <Text style={styles.title}>Colonia</Text>

      {!hasMap && <Button title="Iniciar partida" onPress={handleStartGame} />}
      {hasMap && (
        <>
          <Button title="Finalizar partida" color="red" onPress={handleReset} />

          {/* Producción general */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producción por hora</Text>
            {Object.keys(productionTotal).length === 0 ? (
              <Text style={styles.emptyText}>
                No hay producción actualmente.
              </Text>
            ) : (
              <ResourceDisplay
                resources={productionTotal}
                fontSize={14}
                fontColor="black"
              />
            )}
          </View>

          {/* Procesos en curso */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Procesos en curso</Text>
            {processes.length === 0 && (
              <Text style={styles.emptyText}>No hay procesos activos.</Text>
            )}
            <FlatList
              data={processes}
              keyExtractor={(item) => item.id}
              renderItem={renderProcess}
              style={{ maxHeight: 200 }}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
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
  },

  section: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },

  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },

  processCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
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
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#e53935",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
