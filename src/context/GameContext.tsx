import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConstruction } from "../../hooks/useConstruction";
import { useFleet } from "../../hooks/useFleet";
import { useQuest } from "../../hooks/useQuest";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { BuildingType } from "../../src/types/buildingTypes";
import { Fleet, FleetType } from "../../src/types/fleetType";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest, QuestType } from "../../src/types/questType";
import { StoredResources } from "../../src/types/resourceTypes";
import { normalizeHexMap } from "../../utils/mapUtils";
import { getLabLevel } from "../../utils/researchUtils";
import { loadMap, saveMap } from "../services/storage";
import { Research, ResearchType } from "../types/researchTypes";

type ProviderContextType = {
  resources: StoredResources;
  updateNow: () => void;
  setResources: React.Dispatch<React.SetStateAction<StoredResources>>;
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
  labLevel: number;
  playerQuests: PlayerQuest[];
  completeQuest: (type: QuestType) => void;
  markQuestsAsViewed: (types: QuestType[]) => void;
};

const ResourceContext = createContext<ProviderContextType | undefined>(
  undefined
);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const hexesRef = useRef<Hex[]>([]);
  const [hexes, setHexes] = useState<Hex[]>([]);

  const {
    resources,
    setResources,
    updateNow,
    resetResources,
    resourcesRef,
    ready,
  } = useResources(hexesRef);

  const { playerQuests, completeQuest, markQuestsAsViewed } = useQuest();

  const {
    fleetBuildQueue,
    handleBuildFleet,
    handleCancelFleet,
    processFleetTick,
    resetFleet,
  } = useFleet(resourcesRef, setResources);

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
    useConstruction(hexesRef, setHexes, resourcesRef, setResources, reloadMap);

  const {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
  } = useResearch(resourcesRef, setResources);

  useEffect(() => {
    hexesRef.current = hexes;
  }, [hexes]);

  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      processConstructionTick();
      processResearchTick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ready, processConstructionTick, processResearchTick]);

  useEffect(() => {
    reloadMap();
  }, []);

  const contextValue = useMemo(() => {
    return {
      resources,
      fleetBuildQueue,
      hexes,
      updateNow,
      setResources,
      setHexes,
      reloadMap,
      saveMapToStorage,
      processConstructionTick,
      handleBuild,
      handleCancelBuild,
      resetResources,
      handleResearch,
      handleCancelResearch,
      processResearchTick,
      resetResearch,
      research,
      labLevel: getLabLevel(hexes),
      handleBuildFleet,
      handleCancelFleet,
      processFleetTick,
      resetFleet,
      playerQuests,
      completeQuest,
      markQuestsAsViewed,
    };
  }, [
    resources,
    fleetBuildQueue,
    hexes,
    updateNow,
    setResources,
    setHexes,
    reloadMap,
    saveMapToStorage,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
    resetResources,
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
  ]);

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
