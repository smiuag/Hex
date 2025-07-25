import { ResearchType } from "@/src/types/researchTypes";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IMAGES } from "../../src/constants/images";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { menuStyles } from "../../src/styles/menuStyles";
import { Process } from "../../src/types/processTypes";
import { formatDuration } from "../../utils/generalUtils";
import {
  getBuildingProcesses,
  getResearchProcesses,
} from "../../utils/processUtils";
menuStyles;

export default function MenuComponent() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const {
    handleCancelBuild,
    handleCancelResearch,
    hexes,
    research,
    endGame,
    startGame,
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

  const handleStartGame = async () => {
    startGame();
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
            endGame();
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
    const updatedProcesses = getResearchProcesses(research);
    setProcesses(updatedProcesses);
  };

  const cancelShip = async () => {};

  const renderProcess = ({ item }: { item: Process }) => {
    const elapsed = Date.now() - item.startedAt;
    const timeRemaining = Math.max(0, item.duration - elapsed);

    return (
      <View style={menuStyles.processCard}>
        <Text style={menuStyles.processName}>{item.name}</Text>
        <Text style={menuStyles.processTime}>
          ⏳ {formatDuration(timeRemaining)}
        </Text>
        <TouchableOpacity
          style={commonStyles.cancelButton}
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
          <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground
      source={IMAGES.BACKGROUND_MENU_IMAGE}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={menuStyles.container}>
        <View style={menuStyles.topContainer}>
          <Text style={menuStyles.title}>Colonia</Text>

          {hexes.length > 0 && (
            <>
              {processes.length === 0 ? (
                <Text style={commonStyles.emptyText}>
                  No hay procesos activos.
                </Text>
              ) : (
                <FlatList
                  data={processes}
                  keyExtractor={(item) => item.id}
                  renderItem={renderProcess}
                  contentContainerStyle={{ paddingBottom: 12 }}
                  style={menuStyles.list}
                />
              )}
            </>
          )}
        </View>

        <View>
          {hexes.length == 0 && (
            <Button title="Iniciar partida" onPress={handleStartGame} />
          )}
          {hexes.length > 0 && (
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
