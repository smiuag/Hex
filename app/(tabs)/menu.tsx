import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ResourceBar from "../../components/ResourceBar";
import { BuildingType, TerrainType } from "../../data/tipos";
import { useGameContext } from "../../src/context/GameContext";
import {
  deleteMap,
  loadMap,
  saveMap,
  saveResources,
} from "../../src/services/storage";
import { generateHexGrid, getInitialResources } from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";

export default function MenuScreen() {
  const [checking, setChecking] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const router = useRouter();
  const { setHexes, resetResources } = useGameContext();

  useEffect(() => {
    const checkMap = async () => {
      const savedMap = await loadMap();
      setHasMap(!!savedMap?.length);
      setChecking(false);
    };
    checkMap();
  }, []);

  const handleStartGame = async () => {
    const newMap = generateHexGrid(5).map((hex) => {
      const isBase = hex.q === 0 && hex.r === 0;
      const terrain = isBase
        ? ("base" as TerrainType)
        : ("initial" as TerrainType);

      return {
        ...hex,
        terrain,
        building: isBase ? { type: "base" as BuildingType, level: 1 } : null,
        construction: undefined,
        previousBuilding: null,
      };
    });
    await saveMap(newMap);
    await saveResources(getInitialResources());
    await NotificationManager.cancelAllNotifications();

    setHexes(newMap);
    resetResources();

    setHasMap(true);
    router.replace("/planeta");
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
            setHasMap(false);
            await saveResources(getInitialResources());
            await NotificationManager.cancelAllNotifications();
            resetResources();
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
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Bienvenido a tu mundo</Text>
        {!hasMap && (
          <Button title="Iniciar partida" onPress={handleStartGame} />
        )}
        {hasMap && (
          <Button title="Finalizar partida" color="red" onPress={handleReset} />
        )}
      </View>
      <ResourceBar />
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
  container: {
    flex: 1,
  },
});
