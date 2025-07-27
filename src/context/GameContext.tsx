import React, { createContext, useContext, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import { useFleet } from "../../hooks/useFleet";
import { useHexes } from "../../hooks/useHexes";
import { useQuest } from "../../hooks/useQuest";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { useStarSystem } from "../../hooks/useStarSystem";
import { BuildingType } from "../../src/types/buildingTypes";
import { Fleet, FleetType } from "../../src/types/fleetType";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest, QuestType } from "../../src/types/questType";
import { Resources, StoredResources } from "../../src/types/resourceTypes";
import { NotificationManager } from "../../utils/notificacionUtils";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { Research, ResearchType } from "../types/researchTypes";
import { StarSystem } from "../types/starSystemTypes";

type ProviderContextType = {
  addProduction: (modifications: Partial<Resources>) => void;
  addResources: (modifications: Partial<Resources>) => void;
  subtractResources: (modifications: Partial<Resources>) => void;
  resources: StoredResources;
  hexes: Hex[];
  handleBuild: (q: number, r: number, type: BuildingType) => void;
  handleCancelBuild: (q: number, r: number) => void;
  handleResearch: (type: ResearchType) => void;
  handleCancelResearch: (type: ResearchType) => void;
  fleetBuildQueue: Fleet[];
  handleBuildFleet: (type: FleetType, amount: number) => void;
  handleCancelFleet: (type: FleetType) => void;
  research: Research[];
  playerQuests: PlayerQuest[];
  completeQuest: (type: QuestType) => void;
  markQuestsAsViewed: (types: QuestType[]) => void;
  handleUpdateConfig: (config: ConfigEntry) => void;
  playerConfig: PlayerConfig;
  updatePlayerConfig: (config: PlayerConfig) => void;
  endGame: () => void;
  startGame: () => void;
  starSystems: StarSystem[];
  discardStarSystem: (id: string) => void;
  exploreStarSystem: (id: string) => void;
};

const ResourceContext = createContext<ProviderContextType | undefined>(undefined);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const { resources, resetResources, addProduction, addResources, subtractResources } =
    useResources();

  const { handleBuild, handleCancelBuild, processConstructionTick, resetBuild, hexes } = useHexes(
    resources,
    addProduction,
    addResources,
    subtractResources
  );

  const { playerQuests, completeQuest, markQuestsAsViewed, resetQuests } = useQuest(addResources);

  const { handleUpdateConfig, resetPlayerConfig, playerConfig, updatePlayerConfig } = useConfig();

  const { fleetBuildQueue, handleBuildFleet, handleCancelFleet, processFleetTick, resetFleet } =
    useFleet(addResources, subtractResources);

  const { research, handleResearch, handleCancelResearch, processResearchTick, resetResearch } =
    useResearch(resources, addResources, subtractResources);

  const { discardStarSystem, exploreStarSystem, resetStarSystem, starSystems } = useStarSystem();

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick();
      processFleetTick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [processConstructionTick, processResearchTick]);

  const endGame = async () => {
    await NotificationManager.cancelAllNotifications();
    await resetBuild();
    await resetPlayerConfig();
    await resetResearch();
    await resetQuests();
    await resetFleet();
    await resetResources();
    await resetStarSystem();
  };

  const startGame = async () => {
    await endGame();

    handleUpdateConfig({ key: "GAME_STARTED", value: "true" });
    console.log(playerConfig);
  };

  const contextValue = {
    discardStarSystem,
    exploreStarSystem,
    starSystems,
    handleUpdateConfig,
    playerConfig,
    updatePlayerConfig,
    resources,
    addProduction,
    addResources,
    subtractResources,
    fleetBuildQueue,
    hexes,
    handleBuild,
    handleCancelBuild,
    handleResearch,
    handleCancelResearch,
    research,
    handleBuildFleet,
    handleCancelFleet,
    resetFleet,
    playerQuests,
    completeQuest,
    markQuestsAsViewed,
    endGame,
    startGame,
  };

  return <ResourceContext.Provider value={contextValue}>{children}</ResourceContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(ResourceContext);
  if (!context) throw new Error("useResources debe usarse dentro de ResourceProvider");
  return context;
};
