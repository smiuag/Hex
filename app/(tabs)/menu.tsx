// src/screens/StartScreen.tsx
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
import { TerrainType } from "../../data/tipos";
import { deleteMap, loadMap, saveMap } from "../../src/services/storage";
import { generateHexGrid } from "../../utils/mapGenerator"; // asumiendo que ya existe

export default function MenuScreen() {
  const [checking, setChecking] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMap = async () => {
      const map = await loadMap();

      setHasMap(!!map?.length);
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
        building: isBase ? { type: "base", level: 1 } : null,
        construction: undefined,
        previousBuilding: null,
      };
    });

    await saveMap(newMap);
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
