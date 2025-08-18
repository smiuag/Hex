import { ResearchType } from "@/src/types/researchTypes";
import { ShipId } from "@/src/types/shipType";
import { gameStarted } from "@/utils/configUtils";
import { getCfg } from "@/utils/generalUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ImageBackground, ScrollView, Text, View } from "react-native";
import { researchConfig } from "../../src/config/researchConfig";
import { IMAGES } from "../../src/constants/images";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { menuStyles } from "../../src/styles/menuStyles";
import { Process } from "../../src/types/processTypes";
import {
  getBuildingProcesses,
  getFleetProcesses,
  getResearchProcesses,
  getShipProcesses,
} from "../../utils/processUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";
import { ProcessCard } from "../cards/ProcessCard";

export default function MenuComponent() {
  const { t } = useTranslation("common");
  const { t: tResearch } = useTranslation("research");
  const { t: tShip } = useTranslation("ship");
  const { t: tBuilding } = useTranslation("buildings");
  const [processes, setProcesses] = useState<Process[]>([]);

  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const resources = useGameContextSelector((ctx) => ctx.resources);
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const fleet = useGameContextSelector((ctx) => ctx.fleet);
  const specs = useGameContextSelector((ctx) => ctx.specs);

  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleCancelResearch = useGameContextSelector((ctx) => ctx.handleCancelResearch);
  const handleCancelShip = useGameContextSelector((ctx) => ctx.handleCancelShip);

  const cancelExploreSystem = useGameContextSelector((ctx) => ctx.cancelExploreSystem);
  const cancelAttack = useGameContextSelector((ctx) => ctx.cancelAttack);
  const cancelCollect = useGameContextSelector((ctx) => ctx.cancelCollect);
  const startGame = useGameContextSelector((ctx) => ctx.startGame);

  const router = useRouter();

  useEffect(() => {
    const buildingProcesses = getBuildingProcesses(hexes, tBuilding);
    const researchProcesses = getResearchProcesses(research, tResearch);
    const shipProcesses = getShipProcesses(tShip, shipBuildQueue, specs);
    const fleetProcesses = getFleetProcesses(fleet, specs);
    const allProcesses = [
      ...buildingProcesses,
      ...researchProcesses,
      ...shipProcesses,
      ...fleetProcesses,
    ];
    setProcesses(allProcesses);
  }, [hexes, research, shipBuildQueue, fleet]);

  const started = gameStarted(playerConfig);
  const colonyName = getCfg(playerConfig, "PLANET_NAME");

  const cancelBuild = async (q: number, r: number) => {
    await handleCancelBuild(q, r);
  };

  const cancelResearch = async (type: ResearchType) => {
    await handleCancelResearch(type);
  };

  const onCancelExploreSystem = async (id: string) => {
    await cancelExploreSystem(id);
  };

  const onCancelShip = async (type: ShipId) => {
    await handleCancelShip(type);
  };

  const onCancelAttack = async (id: string) => {
    await cancelAttack(id);
  };

  const onCancelCollect = async (id: string) => {
    await cancelCollect(id);
  };

  const productionPerHour = Object.fromEntries(
    Object.entries(resources?.production ?? {}).map(([key, value]) => [
      key,
      Math.round(value * 3600),
    ])
  );

  function getResearchItemsForMenu() {
    return Object.entries(researchConfig)
      .map(([key, config]) => {
        const type = key as ResearchType;
        const data = (research || []).find((r) => r.data.type === type);
        const currentLevel = data?.data.level ?? 0;
        return {
          key: type,
          name: tResearch(`researchName.${type}`),
          currentLevel,
          maxLevel: config.maxLevel,
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
          <Text style={menuStyles.title}>{colonyName || t("colony")}</Text>

          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>{t("production")} /h:</Text>
            <View style={commonStyles.rowResources}>
              <ResourceDisplay resources={productionPerHour} fontSize={13} />
            </View>
          </View>

          {Array.isArray(processes) && processes.length === 0 ? (
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
          ) : (
            <View style={commonStyles.pt5}>
              {processes.map((item) => (
                <ProcessCard
                  key={`process-${item.id}`}
                  item={item}
                  onCancelBuild={cancelBuild}
                  onCancelResearch={cancelResearch}
                  onCancelShip={onCancelShip}
                  onCancelExploreSystem={onCancelExploreSystem}
                  onCancelAttack={onCancelAttack}
                  onCancelCollect={onCancelCollect}
                />
              ))}
            </View>
          )}
        </View>
        <View style={commonStyles.pt5}>
          {started ? (
            <Button
              title={t("Config")}
              onPress={() => {
                router.replace("/(tabs)/menu/config");
              }}
            />
          ) : (
            <Button title={t("startGame")} onPress={startGame} />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
