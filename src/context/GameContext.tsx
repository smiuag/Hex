// GameProvider.tsx
import { useUniverse } from "@/hooks/useUniverse";
import { getRandomStartSystem } from "@/utils/starSystemUtils";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../../hooks/useConfig";
import { useHexes } from "../../hooks/useHexes";
import { useQuest } from "../../hooks/useQuest";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { useShip } from "../../hooks/useShip";
import { useStarSystem } from "../../hooks/useStarSystem";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest, UpdateQuestOptions } from "../../src/types/questType";
import { Resources, StoredResources } from "../../src/types/resourceTypes";
import { Ship, ShipType } from "../../src/types/shipType";
import { NotificationManager } from "../../utils/notificacionUtils";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { FleetData } from "../types/fleetType";
import { Research, ResearchType } from "../types/researchTypes";
import { StarSystem, StarSystemMap } from "../types/starSystemTypes";

import { createContext, useContextSelector } from "use-context-selector";

// 🎯 Contexto único con suscripción selectiva
type ProviderContextType = {
  fleet: FleetData[];
  resources: StoredResources;
  hexes: Hex[];
  shipBuildQueue: Ship[];
  research: Research[];
  playerQuests: PlayerQuest[];
  playerConfig: PlayerConfig;
  starSystems: StarSystem[];
  universe: StarSystemMap;
  startStarSystemExploration: (id: string) => void;
  startPlanetExploration: (systemId: string, planetId: string) => void;
  addProduction: (modifications: Partial<Resources>) => void;
  addResources: (modifications: Partial<Resources>) => void;
  subtractResources: (modifications: Partial<Resources>) => void;
  handleBuild: (q: number, r: number, type: BuildingType) => void;
  handleCancelBuild: (q: number, r: number) => void;
  handleTerraform: (q: number, r: number) => void;
  handleResearch: (type: ResearchType) => void;
  handleCancelResearch: (type: ResearchType) => void;
  handleBuildShip: (type: ShipType, amount: number) => void;
  handleCancelShip: (type: ShipType) => void;
  updateQuest: (options: UpdateQuestOptions) => void;
  handleUpdateConfig: (config: ConfigEntry) => void;
  endGame: () => void;
  startGame: () => void;
  discardStarSystem: (id: string) => void;
  cancelExploreSystem: (id: string) => void;
  stelarPortStartBuild: (id: string) => void;
  extractionStartBuild: (id: string) => void;
  defenseStartBuild: (id: string) => void;
  cancelExplorePlanet: (systemId: string, planetId: string) => void;
  startAttack: (systemId: string, fleet: Ship[]) => void;
  cancelAttack: (id: string) => void;
  enoughResources: (cost: Partial<Resources>) => boolean;
  scanStarSystem: (currentSystemId: string, id: string) => void;
  recoverStarSystem: (id: string) => void;
  cancelScanStarSystem: (id: string) => void;
  handleDestroyBuilding: (q: number, r: number) => void;
};

// 🎯 Contexto único creado con use-context-selector
const GameContext = createContext<ProviderContextType>(null as any);

// 🧠 Provider
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { t: tResearch } = useTranslation("research");
  const { universe } = useUniverse();

  const { playerConfig, handleUpdateConfig, resetPlayerConfig } = useConfig();

  const {
    resources,
    resetResources,
    addProduction,
    addResources,
    subtractResources,
    enoughResources,
  } = useResources();

  const { playerQuests, updateQuest, resetQuests } = useQuest(addResources);

  const {
    hexes,
    handleBuild,
    handleCancelBuild,
    processConstructionTick,
    resetBuild,
    handleTerraform,
    handleDestroyBuilding,
  } = useHexes(
    addProduction,
    addResources,
    subtractResources,
    enoughResources,
    handleUpdateConfig,
    updateQuest
  );

  const {
    shipBuildQueue,
    handleBuildShip,
    handleCancelShip,
    processShipTick,
    resetShip,
    handleDestroyShip,
    handleCreateShips,
  } = useShip(playerQuests, addResources, subtractResources, enoughResources, updateQuest);

  const { research, handleResearch, handleCancelResearch, processResearchTick, resetResearch } =
    useResearch(addResources, subtractResources, enoughResources, updateQuest);

  const {
    fleet,
    starSystems,
    discardStarSystem,
    resetStarSystem,
    startPlanetExploration,
    cancelExploreSystem,
    cancelExplorePlanet,
    startStarSystemExploration,
    processFleeTick,
    processColonialTick,
    resetFleet,
    stelarPortStartBuild,
    extractionStartBuild,
    defenseStartBuild,
    startAttack,
    cancelAttack,
    scanStarSystem,
    recoverStarSystem,
    cancelScanStarSystem,
  } = useStarSystem(
    playerQuests,
    universe,
    handleDestroyShip,
    handleCreateShips,
    subtractResources,
    updateQuest
  );

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick(tResearch);
      processShipTick();
      processFleeTick();
      processColonialTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [
    processConstructionTick,
    processResearchTick,
    processShipTick,
    processFleeTick,
    processColonialTick,
  ]);

  const endGame = async () => {
    await NotificationManager.cancelAllNotifications();
    await resetBuild();
    await resetPlayerConfig();
    await resetResearch();
    await resetQuests();
    await resetShip();
    await resetResources();
    await resetStarSystem();
    await resetFleet();
  };

  const startGame = async () => {
    try {
      await endGame();
    } catch (exception) {
    } finally {
      await handleUpdateConfig({ key: "GAME_STARTED", value: "true" });
      await handleUpdateConfig({ key: "MAP_SIZE", value: "SMALL" });
      await handleUpdateConfig({
        key: "STARTING_SYSTEM",
        value: getRandomStartSystem(universe).id,
      });
      await updateQuest({
        type: "START",
        available: true,
        completed: false,
        viewed: false,
        rewardClaimed: false,
      });
    }
  };

  const contextValue = useMemo<ProviderContextType>(
    () => ({
      fleet,
      starSystems,
      playerConfig,
      resources,
      shipBuildQueue,
      hexes,
      research,
      playerQuests,
      universe,
      startStarSystemExploration,
      startPlanetExploration,
      discardStarSystem,
      handleUpdateConfig,
      addProduction,
      addResources,
      subtractResources,
      handleBuild,
      handleCancelBuild,
      handleTerraform,
      handleResearch,
      handleCancelResearch,
      handleBuildShip,
      handleCancelShip,
      updateQuest,
      endGame,
      startGame,
      cancelExploreSystem,
      stelarPortStartBuild,
      extractionStartBuild,
      defenseStartBuild,
      cancelExplorePlanet,
      startAttack,
      cancelAttack,
      enoughResources,
      scanStarSystem,
      recoverStarSystem,
      cancelScanStarSystem,
      handleDestroyBuilding,
    }),
    [
      fleet,
      starSystems,
      playerConfig,
      resources,
      shipBuildQueue,
      hexes,
      research,
      playerQuests,
      universe,
      startStarSystemExploration,
      startPlanetExploration,
      discardStarSystem,
      handleUpdateConfig,
      addProduction,
      addResources,
      subtractResources,
      handleBuild,
      handleCancelBuild,
      handleTerraform,
      handleResearch,
      handleCancelResearch,
      handleBuildShip,
      handleCancelShip,
      updateQuest,
      endGame,
      startGame,
      cancelExploreSystem,
      stelarPortStartBuild,
      extractionStartBuild,
      defenseStartBuild,
      cancelExplorePlanet,
      startAttack,
      cancelAttack,
      enoughResources,
      scanStarSystem,
      recoverStarSystem,
      cancelScanStarSystem,
      handleDestroyBuilding,
    ]
  );

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

// 🔎 Hook para seleccionar partes específicas del contexto
export const useGameContextSelector = <T,>(selector: (ctx: ProviderContextType) => T): T => {
  const value = useContextSelector(GameContext, selector);
  if (value === null) throw new Error("useGameContextSelector debe usarse dentro de GameProvider");
  return value;
};
