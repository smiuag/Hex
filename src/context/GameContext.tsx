import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useConfig } from "../../hooks/useConfig";
import { useConstruction } from "../../hooks/useConstruction";
import { useFleet } from "../../hooks/useFleet";
import { useQuest } from "../../hooks/useQuest";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { BuildingType } from "../../src/types/buildingTypes";
import { Fleet, FleetType } from "../../src/types/fleetType";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest, QuestType } from "../../src/types/questType";
import { Resources, StoredResources } from "../../src/types/resourceTypes";
import { normalizeHexMap } from "../../utils/mapUtils";

import { generateHexGrid, getInitialResources } from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";
import {
  deleteMap,
  deleteResearch,
  loadMap,
  saveMap,
  saveResources,
} from "../services/storage";
import { ConfigEntry, PlayerConfig } from "../types/configTypes";
import { Research, ResearchType } from "../types/researchTypes";

type ProviderContextType = {
  addProduction: (modifications: Partial<Resources>) => void;
  addResources: (modifications: Partial<Resources>) => void;
  subtractResources: (modifications: Partial<Resources>) => void;
  resources: StoredResources;
  hexes: Hex[];
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>;
  reloadMap: () => Promise<void>;
  saveMapToStorage: (map: Hex[]) => Promise<void>;
  processConstructionTick: () => void;
  handleBuild: (q: number, r: number, type: BuildingType) => void;
  handleCancelBuild: (q: number, r: number) => void;
  resetResources: () => void;
  resetResearch: () => void;
  handleResearch: (type: ResearchType) => void;
  processResearchTick: () => void;
  handleCancelResearch: (type: ResearchType) => void;
  fleetBuildQueue: Fleet[];
  handleBuildFleet: (type: FleetType, amount: number) => void;
  handleCancelFleet: (type: FleetType) => void;
  research: Research[];
  playerQuests: PlayerQuest[];
  completeQuest: (type: QuestType) => void;
  markQuestsAsViewed: (types: QuestType[]) => void;
  resetQuests: () => void;
  handleUpdateConfig: (config: ConfigEntry) => void;
  resetPlayerConfig: () => void;
  loadPlayerConfig: () => void;
  playerConfig: PlayerConfig;
  updatePlayerConfig: (config: PlayerConfig) => void;
  endGame: () => void;
  startGame: () => void;
};

const ResourceContext = createContext<ProviderContextType | undefined>(
  undefined
);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const hexesRef = useRef<Hex[]>([]);
  const [hexes, setHexes] = useState<Hex[]>([]);

  const {
    resources,
    resetResources,
    addProduction,
    addResources,
    subtractResources,
  } = useResources(hexesRef);

  const { playerQuests, completeQuest, markQuestsAsViewed, resetQuests } =
    useQuest(addResources);

  const {
    handleUpdateConfig,
    resetPlayerConfig,
    loadPlayerConfig,
    playerConfig,
    updatePlayerConfig,
  } = useConfig();

  const {
    fleetBuildQueue,
    handleBuildFleet,
    handleCancelFleet,
    processFleetTick,
    resetFleet,
  } = useFleet(resources, addResources, subtractResources);

  const reloadMap = useCallback(async () => {
    const saved = await loadMap();
    const normalized = saved ? normalizeHexMap(saved) : [];
    setHexes(normalized);
    hexesRef.current = normalized;
  }, []);

  const saveMapToStorage = useCallback(async (map: Hex[]) => {
    setHexes(map);
    hexesRef.current = map;
    await saveMap(map);
  }, []);

  const { handleBuild, handleCancelBuild, processConstructionTick } =
    useConstruction(
      hexesRef,
      setHexes,
      resources,
      addProduction,
      addResources,
      subtractResources,
      reloadMap
    );

  const {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
  } = useResearch(resources, addResources, subtractResources);

  useEffect(() => {
    hexesRef.current = hexes;
  }, [hexes]);

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [processConstructionTick, processResearchTick]);

  useEffect(() => {
    reloadMap();
  }, []);

  const endGame = async () => {
    await deleteMap();
    await saveResources(getInitialResources());
    await NotificationManager.cancelAllNotifications();
    await deleteResearch();
    await resetPlayerConfig();
    resetResearch();
    resetQuests();
    resetFleet();
    setHexes([]);
    resetResources();
  };

  const startGame = async () => {
    const newMap = generateHexGrid(2).map((hex) => {
      const isBase = hex.q === 0 && hex.r === 0;
      const terrain = isBase ? ("base" as any) : ("initial" as any);

      return {
        ...hex,
        terrain,
        building: isBase ? { type: "BASE" as BuildingType, level: 1 } : null,
        construction: undefined,
        previousBuilding: null,
      };
    });

    endGame();
    setHexes(newMap);
  };

  const contextValue = {
    handleUpdateConfig,
    resetPlayerConfig,
    loadPlayerConfig,
    playerConfig,
    updatePlayerConfig,
    resources,
    resetResources,
    resetQuests,
    addProduction,
    addResources,
    subtractResources,
    fleetBuildQueue,
    hexes,
    setHexes,
    reloadMap,
    saveMapToStorage,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
    research,
    handleBuildFleet,
    handleCancelFleet,
    processFleetTick,
    resetFleet,
    playerQuests,
    completeQuest,
    markQuestsAsViewed,
    endGame,
    startGame,
  };

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(ResourceContext);
  if (!context)
    throw new Error("useResources debe usarse dentro de ResourceProvider");
  return context;
};
