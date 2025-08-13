// GameProvider.tsx
import { useUniverse } from "@/hooks/useUniverse";
import { getRandomStartSystem } from "@/utils/starSystemUtils";
import React, { useEffect, useMemo } from "react";

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
import { CombinedResources, StoredResources } from "../../src/types/resourceTypes";
import { Ship, ShipType } from "../../src/types/shipType";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { FleetData } from "../types/fleetType";
import { Research, ResearchType } from "../types/researchTypes";
import { StarSystem, StarSystemMap } from "../types/starSystemTypes";

import { useDiplomacy } from "@/hooks/useDiplomacy";
import { createContext, useContextSelector } from "use-context-selector";
import { DiplomaticEvent, EventOption } from "../types/eventTypes";
import { DiplomacyLevel } from "../types/raceType";

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
  playerDiplomacy: DiplomacyLevel[];
  currentEvent: DiplomaticEvent;
  startStarSystemExploration: (id: string) => void;
  startCelestialBodyExploration: (systemId: string, planetId: string) => void;
  addProduction: (modifications: Partial<CombinedResources>, effectiveAt: number) => void;
  addResources: (modifications: Partial<CombinedResources>) => void;
  subtractResources: (modifications: Partial<CombinedResources>) => void;
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
  starPortStartBuild: (id: string) => void;
  extractionStartBuild: (id: string) => void;
  defenseStartBuild: (id: string) => void;
  cancelExplorePlanet: (systemId: string, planetId: string) => void;
  startAttack: (systemId: string, fleet: Ship[]) => void;
  cancelAttack: (id: string) => void;
  enoughResources: (cost: Partial<CombinedResources>) => boolean;
  scanStarSystem: (currentSystemId: string, id: string) => void;
  recoverStarSystem: (id: string) => void;
  cancelScanStarSystem: (id: string) => void;
  handleDestroyBuilding: (q: number, r: number) => void;
  startCollectSystem: (systemId: string) => void;
  setHexAncientStructure: (hex: Hex) => void;
  cancelCollect: (systemId: string) => void;
  handleEventOptionChoose: (option: EventOption) => void;
};

const GameContext = createContext<ProviderContextType>(null as any);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
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
    setHexAncientStructure,
    stopConstruction,
    bombingSystem,
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

  const {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
    discoverNextResearch,
    stopResearch,
  } = useResearch(addResources, subtractResources, enoughResources, updateQuest);

  const {
    playerDiplomacy,
    currentEvent,
    resetPlayerEvent,
    resetPlayerDiplomacy,
    handleEventOptionChoose,
    loadEvent,
    modifyEvent,
    handleModifyDiplomacy,
  } = useDiplomacy(
    shipBuildQueue,
    handleDestroyShip,
    handleCreateShips,
    addResources,
    subtractResources,
    discoverNextResearch,
    stopResearch,
    stopConstruction,
    bombingSystem
  );

  const {
    fleet,
    starSystems,
    discardStarSystem,
    resetStarSystem,
    startCelestialBodyExploration,
    cancelExploreSystem,
    cancelExplorePlanet,
    startStarSystemExploration,
    processFleeTick,
    processColonialTick,
    resetFleet,
    starPortStartBuild,
    extractionStartBuild,
    defenseStartBuild,
    startAttack,
    cancelAttack,
    scanStarSystem,
    recoverStarSystem,
    cancelScanStarSystem,
    startCollectSystem,
    cancelCollect,
  } = useStarSystem(
    playerQuests,
    universe,
    handleDestroyShip,
    handleCreateShips,
    subtractResources,
    addResources,
    updateQuest,
    handleModifyDiplomacy
  );

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick();
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
    //updateQuest({ type: "BUILDING_ANTENNA", completed: false, rewardClaimed: false });
    // await modifyEvent((prev) => {
    //   return { ...prev, completed: false, completedTime: undefined, type: "DEFAULT" };
    // });
    // addResources({ NEBULITA: 200000 });
    //await NotificationManager.cancelAllNotifications();
    await resetPlayerEvent();
    //await loadEvent();
    await resetBuild();
    await resetPlayerConfig();
    await resetResearch();
    await resetQuests();
    await resetShip();
    await resetResources();
    await resetStarSystem();
    await resetFleet();
    await resetPlayerDiplomacy();
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
      playerDiplomacy,
      currentEvent,
      startStarSystemExploration,
      startCelestialBodyExploration,
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
      starPortStartBuild,
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
      startCollectSystem,
      setHexAncientStructure,
      cancelCollect,
      handleEventOptionChoose,
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
      playerDiplomacy,
      currentEvent,
      startStarSystemExploration,
      startCelestialBodyExploration,
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
      starPortStartBuild,
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
      startCollectSystem,
      setHexAncientStructure,
      cancelCollect,
      handleEventOptionChoose,
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
