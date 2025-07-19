import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGameContext } from "../../src/context/GameContext";
import {
  deleteMap,
  deleteResearchs,
  loadMap,
  saveMap,
  saveResources,
} from "../../src/services/storage";
import { BuildingType } from "../../src/types/buildingTypes";
import { TerrainType } from "../../src/types/terrainTypes";
import { generateHexGrid, getInitialResources } from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";

export default function MenuComponent() {
  const [checking, setChecking] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const { setHexes, resetResources, resetResearch } = useGameContext();

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
      const terrain = isBase
        ? ("base" as TerrainType)
        : ("initial" as TerrainType);

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
    await deleteResearchs();
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
            await deleteResearchs();
            resetResearch();

            setHexes([]);
            resetResources();
            setHasMap(false);
          },
        },
      ]
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
    <View style={styles.center}>
      <Text style={styles.title}>Bienvenido a tu mundo</Text>
      {!hasMap && <Button title="Iniciar partida" onPress={handleStartGame} />}
      {hasMap && (
        <Button title="Finalizar partida" color="red" onPress={handleReset} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
