import { FleetType } from "@/src/types/fleetType";
import { ResearchType } from "@/src/types/researchTypes";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";
import { researchTechnologies } from "../../src/config/researchConfig";
import { IMAGES } from "../../src/constants/images";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { menuStyles } from "../../src/styles/menuStyles";
import { Process } from "../../src/types/processTypes";
import {
  getBuildingProcesses,
  getResearchProcesses,
} from "../../utils/processUtils";
import { getLabLevel } from "../../utils/researchUtils";
import { ProcessCard } from "../secondary/ProcessCard";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

export default function MenuComponent() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const {
    handleCancelBuild,
    handleCancelResearch,
    handleCancelFleet,
    hexes,
    research,
    resources,
    endGame,
    startGame,
  } = useGameContext();

  useEffect(() => {
    const buildingProcesses = getBuildingProcesses(hexes);
    const researchProcesses = getResearchProcesses(research);
    const allProcesses = [...buildingProcesses, ...researchProcesses];
    setProcesses(allProcesses);
  }, [hexes, research]);

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
  };

  const cancelResearch = async (type: ResearchType) => {
    await handleCancelResearch(type);
  };

  const onCancelFleet = async (type: FleetType) => {
    await handleCancelFleet(type);
  };

  const productionPerHour = Object.fromEntries(
    Object.entries(resources?.production ?? {}).map(([key, value]) => [
      key,
      Math.round(value * 3600),
    ])
  );

  function getResearchItemsForMenu() {
    return Object.entries(researchTechnologies)
      .map(([key, config]) => {
        const type = key as ResearchType;
        const data = (research || []).find((r) => r.data.type === type);
        const currentLevel = data?.data.level ?? 0;
        const isAvailable = config.labLevelRequired <= getLabLevel(hexes);
        return {
          key: type,
          name: config.name,
          currentLevel,
          maxLevel: config.maxLevel,
          isAvailable,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  const researchItems = getResearchItemsForMenu();

  return (
    <ImageBackground
      source={IMAGES.BACKGROUND_MENU_IMAGE}
      style={commonStyles.flex1}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[commonStyles.ph10, commonStyles.flexGrow1]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={menuStyles.title}>Colonia</Text>

          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>Producción:</Text>
            <View style={commonStyles.rowResources}>
              <ResourceDisplay resources={productionPerHour} fontSize={13} />
            </View>
          </View>
          <View>
            {researchItems.map((item) => {
              const maxDots = 80;
              const charWeight = 2;
              const dotsCount = Math.max(
                0,
                Math.floor(maxDots - item.name.length * charWeight)
              );
              const dots = ".".repeat(dotsCount);

              return (
                <View style={menuStyles.researchItem} key={item.key}>
                  <Text style={menuStyles.researchName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={menuStyles.dots} numberOfLines={1}>
                    {dots}
                  </Text>
                  <Text style={menuStyles.researchLevel}>
                    {item.currentLevel}/{item.maxLevel}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={commonStyles.pt5}>
            {processes.map((item) => {
              return (
                <ProcessCard
                  key={`process-${item.id}`}
                  item={item}
                  onCancelBuild={cancelBuild}
                  onCancelResearch={cancelResearch}
                  onCancelFleet={onCancelFleet}
                />
              );
            })}
          </View>
        </View>
        <View style={commonStyles.pt5}>
          {hexes.length == 0 && (
            <Button title="Iniciar partida" onPress={startGame} />
          )}
          {hexes.length > 0 && (
            <Button
              title="Finalizar partida"
              color="red"
              onPress={handleReset}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
