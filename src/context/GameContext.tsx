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
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { StoredResources } from "../../src/types/resourceTypes";
import { normalizeHexMap } from "../../utils/mapUtils";
import { getLabLevel } from "../../utils/researchUtils";
import { loadMap, saveMap } from "../services/storage";
import { Research, ResearchType } from "../types/researchTypes";

type ResourceContextType = {
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
  research: Research[];
  labLevel: number;
};

const ResourceContext = createContext<ResourceContextType | undefined>(
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
    useConstruction(hexesRef, setHexes, resourcesRef, setResources);

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

  // ✅ Solo procesamos construcción/investigación, no updateNow
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
      updateNow,
      setResources,
      hexes,
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
    };
  }, [
    resources,
    updateNow,
    setResources,
    hexes,
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
