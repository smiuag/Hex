import React, { createContext, useContext, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import { useHexes } from "../../hooks/useHexes";
import { useQuest } from "../../hooks/useQuest";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { useShip } from "../../hooks/useShip";
import { useStarSystem } from "../../hooks/useStarSystem";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest, QuestType } from "../../src/types/questType";
import { Resources, StoredResources } from "../../src/types/resourceTypes";
import { Ship, ShipType } from "../../src/types/shipType";
import { NotificationManager } from "../../utils/notificacionUtils";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { FleetData } from "../types/fleetType";
import { Research, ResearchType } from "../types/researchTypes";
import { StarSystem } from "../types/starSystemTypes";

type ProviderContextType = {
  fleet: FleetData[];
  resources: StoredResources;
  hexes: Hex[];
  shipBuildQueue: Ship[];
  research: Research[];
  playerQuests: PlayerQuest[];
  playerConfig: PlayerConfig;
  starSystems: StarSystem[];
  startStarSystemExploration: (id: string) => void;
  explorePlanet: (systemId: string, planetId: string) => void;
  addProduction: (modifications: Partial<Resources>) => void;
  addResources: (modifications: Partial<Resources>) => void;
  subtractResources: (modifications: Partial<Resources>) => void;
  handleBuild: (q: number, r: number, type: BuildingType) => void;
  handleCancelBuild: (q: number, r: number) => void;
  handleResearch: (type: ResearchType) => void;
  handleCancelResearch: (type: ResearchType) => void;
  handleBuildShip: (type: ShipType, amount: number) => void;
  handleCancelShip: (type: ShipType) => void;
  completeQuest: (type: QuestType) => void;
  markQuestsAsViewed: (types: QuestType[]) => void;
  handleUpdateConfig: (config: ConfigEntry) => void;
  updatePlayerConfig: (config: PlayerConfig) => void;
  endGame: () => void;
  startGame: () => void;
  discardStarSystem: (id: string) => void;
  cancelExploreSystem: (id: string) => void;
};

const ResourceContext = createContext<ProviderContextType | undefined>(undefined);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  //USE RESOURCES
  const { resources, resetResources, addProduction, addResources, subtractResources } =
    useResources();

  //USE HEXES
  const { handleBuild, handleCancelBuild, processConstructionTick, resetBuild, hexes } = useHexes(
    resources,
    addProduction,
    addResources,
    subtractResources
  );

  //USE QUEST
  const { playerQuests, completeQuest, markQuestsAsViewed, resetQuests } = useQuest(addResources);

  //USE CONFIG
  const { handleUpdateConfig, resetPlayerConfig, playerConfig, updatePlayerConfig } = useConfig();

  //USE SHIP
  const {
    shipBuildQueue,
    handleBuildShip,
    handleCancelShip,
    processShipTick,
    resetShip,
    handleDestroyShip,
    handleCreateShips,
  } = useShip(addResources, subtractResources);

  //USE RESEARCH
  const { research, handleResearch, handleCancelResearch, processResearchTick, resetResearch } =
    useResearch(resources, addResources, subtractResources);

  //USE STAR SYSTEM
  const {
    fleet,
    starSystems,
    discardStarSystem,
    resetStarSystem,
    explorePlanet,
    cancelExploreSystem,
    startStarSystemExploration,
    processFleeTick,
    resetFleet,
  } = useStarSystem(handleDestroyShip, handleCreateShips);

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick();
      processShipTick();
      processFleeTick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [processConstructionTick, processResearchTick, processFleeTick, processShipTick]);

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
    await endGame();

    handleUpdateConfig({ key: "GAME_STARTED", value: "true" });
  };

  const contextValue = {
    fleet,
    starSystems,
    playerConfig,
    resources,
    shipBuildQueue,
    hexes,
    research,
    playerQuests,
    startStarSystemExploration,
    explorePlanet,
    discardStarSystem,
    handleUpdateConfig,
    updatePlayerConfig,
    addProduction,
    addResources,
    subtractResources,
    handleBuild,
    handleCancelBuild,
    handleResearch,
    handleCancelResearch,
    handleBuildShip,
    handleCancelShip,
    resetShip,
    completeQuest,
    markQuestsAsViewed,
    endGame,
    startGame,
    cancelExploreSystem,
  };

  return <ResourceContext.Provider value={contextValue}>{children}</ResourceContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(ResourceContext);
  if (!context) throw new Error("useResources debe usarse dentro de ResourceProvider");
  return context;
};
