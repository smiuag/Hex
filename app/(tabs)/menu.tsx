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
import { generateHexGrid, getInitialResources } from "../../utils/mapGenerator";

export default function MenuScreen() {
  const [checking, setChecking] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const router = useRouter();

  const { setHexes, setResources } = useGameContext();

  useEffect(() => {
    const checkMap = async () => {
      const savedMap = await import("../../src/services/storage").then((mod) =>
        mod.loadMap()
      );
      setHasMap(!!savedMap?.length);
      setChecking(false);
    };
    checkMap();
  }, []);

  const handleStartGame = async () => {
    const newMap = generateHexGrid(4).map((hex) => {
      const isBase = hex.q === 0 && hex.r === 0;
      const terrain = isBase
        ? ("base" as TerrainType)
        : ("forest" as TerrainType);

      return {
        ...hex,
        terrain,
        building: isBase ? { type: "base" as BuildingType, level: 1 } : null,
        construction: undefined,
        previousBuilding: null,
      };
    });

    const { saveMap, saveResources } = await import(
      "../../src/services/storage"
    );
    await saveMap(newMap);
    await saveResources(getInitialResources());

    setHexes(newMap);
    setResources(getInitialResources());

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
            const { deleteMap } = await import("../../src/services/storage");
            await deleteMap();
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
      <ResourceBar />
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
