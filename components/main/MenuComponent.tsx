import { ResearchType } from "@/src/types/researchTypes";
import { ShipType } from "@/src/types/shipType";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, ImageBackground, ScrollView, Text, View } from "react-native";
import { researchTechnologies } from "../../src/config/researchConfig";
import { IMAGES } from "../../src/constants/images";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { menuStyles } from "../../src/styles/menuStyles";
import { Process } from "../../src/types/processTypes";
import { gameStarted } from "../../utils/configUtils";
import {
  getBuildingProcesses,
  getFleetProcesses,
  getResearchProcesses,
  getShipProcesses,
} from "../../utils/processUtils";
import { getLabLevel } from "../../utils/researchUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";
import { ProcessCard } from "../cards/ProcessCard";

export default function MenuComponent() {
  const { t } = useTranslation("common");
  const { t: tResearch } = useTranslation("research");
  const { t: tShip } = useTranslation("ship");
  const [processes, setProcesses] = useState<Process[]>([]);
  const {
    hexes,
    research,
    resources,
    shipBuildQueue,
    playerConfig,
    fleet,
    handleCancelBuild,
    handleCancelResearch,
    handleCancelShip,
    endGame,
    startGame,
  } = useGameContext();

  const started = gameStarted(playerConfig);

  useEffect(() => {
    const buildingProcesses = getBuildingProcesses(hexes);
    const researchProcesses = getResearchProcesses(research);
    const shipProcesses = getShipProcesses(tShip, shipBuildQueue);
    const fleetProcesses = getFleetProcesses(fleet);
    const allProcesses = [
      ...buildingProcesses,
      ...researchProcesses,
      ...shipProcesses,
      ...fleetProcesses,
    ];
    setProcesses(allProcesses);
  }, [hexes, research, shipBuildQueue, fleet]);

  const handleReset = () => {
    Alert.alert(t("endGameTitle"), t("endGameConfirmation"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirmDelete"),
        style: "destructive",
        onPress: async () => {
          endGame();
        },
      },
    ]);
  };

  const cancelBuild = async (q: number, r: number) => {
    await handleCancelBuild(q, r);
  };

  const cancelResearch = async (type: ResearchType) => {
    await handleCancelResearch(type);
  };

  const onCancelShip = async (type: ShipType) => {
    await handleCancelShip(type);
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
          name: tResearch(`researchName.${type}`),
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
          <Text style={menuStyles.title}>{t("colony")}</Text>

          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>{t("production")}:</Text>
            <View style={commonStyles.rowResources}>
              <ResourceDisplay resources={productionPerHour} fontSize={13} />
            </View>
          </View>

          <View>
            {researchItems.map((item) => {
              const maxDots = 80;
              const charWeight = 2;
              const dotsCount = Math.max(0, Math.floor(maxDots - item.name.length * charWeight));
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
            {processes.map((item) => (
              <ProcessCard
                key={`process-${item.id}`}
                item={item}
                onCancelBuild={cancelBuild}
                onCancelResearch={cancelResearch}
                onCancelShip={onCancelShip}
              />
            ))}
          </View>
        </View>

        <View style={commonStyles.pt5}>
          {started ? (
            <Button title={t("endGame")} color="red" onPress={handleReset} />
          ) : (
            <Button title={t("startGame")} onPress={startGame} />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
