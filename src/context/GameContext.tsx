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
import {
  CustomShipSpec,
  CustomShipTypeId,
  Draft,
  Ship,
  ShipDesignAttempt,
  ShipId,
  ShipSpecsCtx,
} from "../../src/types/shipType";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { FleetData } from "../types/fleetType";
import { Research, ResearchType } from "../types/researchTypes";
import { StarSystem, StarSystemMap } from "../types/starSystemTypes";

import { useAchievements } from "@/hooks/useAchievements";
import { useDiplomacy } from "@/hooks/useDiplomacy";
import { useShipDesigns } from "@/hooks/useShipDesigns";
import { useShipSpecs } from "@/hooks/useShipSpecs";
import { tSafeNS } from "@/utils/generalUtils";
import Toast from "react-native-toast-message";
import { createContext, useContextSelector } from "use-context-selector";
import { PlayerAchievement } from "../types/achievementTypes";
import { DiplomaticEvent, EventOption } from "../types/eventTypes";
import { StartAttemptParams, StartAttemptResult } from "../types/providerContextTypes";
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
  playerAchievements: PlayerAchievement[];
  specs: ShipSpecsCtx;
  active: ShipDesignAttempt;
  history: ShipDesignAttempt[];
  resetShipDesign: () => Promise<void>;
  computeEffectiveChance: (
    draft: Draft,
    baseChance: number
  ) => {
    effective: number;
    bonus: number;
    streak: number;
  };
  startAttempt: (params: StartAttemptParams) => Promise<StartAttemptResult>;
  resolveAttempt: (opts: { success: boolean; specIdIfSuccess?: CustomShipTypeId }) => Promise<void>;
  cancelActiveAttempt: () => Promise<void>;
  getProgress: (id: string) => void;
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
  handleBuildShip: (type: ShipId, amount: number) => void;
  handleCancelShip: (type: ShipId) => void;
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
  discoverNextResearch: () => void;
  handleCreateShips: (shipsToAdd: { type: ShipId; amount: number }[]) => void;
  hasDiscoverableResearch: () => boolean;
  upsertSpec: (spec: CustomShipSpec) => void;
};

const GameContext = createContext<ProviderContextType>(null as any);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const tAch = useMemo(() => tSafeNS("achievements"), []);

  const { specs, upsertSpec, resetSpecs } = useShipSpecs();

  const { universe } = useUniverse();

  const { playerAchievements, getProgress, onAchievementEvent, resetAchievements } =
    useAchievements({
      toast: ({ titleKey, icon }: { titleKey?: string; icon?: string }) => {
        Toast.show({
          type: "success",
          text1: `${icon ?? "🏆"} ${tAch(titleKey)}`,
          visibilityTime: 2500,
        });
      },
    });

  const { playerConfig, handleUpdateConfig, resetPlayerConfig } = useConfig();

  const {
    resources,
    resetResources,
    addProduction,
    addResources,
    subtractResources,
    enoughResources,
  } = useResources(onAchievementEvent);

  const { playerQuests, updateQuest, resetQuests } = useQuest(addResources, onAchievementEvent);

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
    updateQuest,
    onAchievementEvent
  );

  const {
    shipBuildQueue,
    handleBuildShip,
    handleCancelShip,
    processShipTick,
    resetShip,
    handleDestroyShip,
    handleCreateShips,
  } = useShip(
    playerQuests,
    specs,
    addResources,
    subtractResources,
    enoughResources,
    updateQuest,
    onAchievementEvent
  );

  const {
    history,
    active,
    resetShipDesign,
    computeEffectiveChance,
    startAttempt,
    resolveAttempt,
    cancelActiveAttempt,
  } = useShipDesigns(
    playerConfig,
    subtractResources,
    handleUpdateConfig,
    handleCreateShips,
    upsertSpec
  );

  const {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
    discoverNextResearch,
    stopResearch,
    hasDiscoverableResearch,
  } = useResearch(
    addResources,
    subtractResources,
    enoughResources,
    updateQuest,
    onAchievementEvent
  );

  const {
    playerDiplomacy,
    currentEvent,
    resetPlayerEvent,
    resetPlayerDiplomacy,
    handleEventOptionChoose,
    modifyEvent,
    handleModifyDiplomacy,
  } = useDiplomacy(
    shipBuildQueue,
    playerConfig,
    resources,
    specs,
    handleDestroyShip,
    handleCreateShips,
    addResources,
    subtractResources,
    discoverNextResearch,
    stopResearch,
    stopConstruction,
    bombingSystem,
    onAchievementEvent
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
    specs,
    handleDestroyShip,
    handleCreateShips,
    subtractResources,
    addResources,
    updateQuest,
    handleModifyDiplomacy,
    onAchievementEvent
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
    await resetPlayerEvent();
    await resetBuild();
    await resetPlayerConfig();
    await resetResearch();
    await resetQuests();
    await resetShip();
    await resetResources();
    await resetStarSystem();
    await resetFleet();
    await resetPlayerDiplomacy();
    await resetAchievements();
    await resetShipDesign();
    await resetSpecs();

    // addResources({
    //   METAL: 100000000,
    //   STONE: 100000000,
    //   CRYSTAL: 100000000,
    //   AETHERIUM: 100000000,
    //   ENERGY: 100000000,
    //   ILMENITA: 100000000,
    //   KAIROX: 100000000,
    //   NEBULITA: 100000000,
    //   THARNIO: 100000000,
    // });
  };

  const startGame = async () => {
    try {
      await endGame();
    } catch (exception) {
    } finally {
      await handleUpdateConfig({ key: "GAME_STARTED", value: "true" });
      await handleUpdateConfig({ key: "PLANET_NAME", value: "Colonia 9" });
      await handleUpdateConfig({ key: "PLAYER_LANGUAGE", value: "es" });
      await handleUpdateConfig({ key: "PLAYER_NAME", value: "Lucas Vera" });
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
      playerAchievements,
      specs,
      active,
      history,
      resetShipDesign,
      computeEffectiveChance,
      startAttempt,
      resolveAttempt,
      cancelActiveAttempt,
      getProgress,
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
      discoverNextResearch,
      handleCreateShips,
      hasDiscoverableResearch,
      upsertSpec,
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
      playerAchievements,
      specs,
      active,
      history,
      resetShipDesign,
      computeEffectiveChance,
      startAttempt,
      resolveAttempt,
      cancelActiveAttempt,
      getProgress,
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
      discoverNextResearch,
      handleCreateShips,
      hasDiscoverableResearch,
      upsertSpec,
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
