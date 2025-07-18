import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useConstruction } from "../../hooks/useConstruction";
import { useResearch } from "../../hooks/useResearch";
import { useResources } from "../../hooks/useResources";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { StoredResources } from "../../src/types/resourceTypes";
import { getLabLevel } from "../../utils/buildingUtils";
import { normalizeHexMap } from "../../utils/mapUtils";
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
  handleResearch: (type: ResearchType) => void;
  processResearchTick: () => void;
  cancelResearch: () => void;
  research: Research[];
  labLevel: number;
};

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexesRef = useRef<Hex[]>([]);

  const {
    resources,
    setResources,
    updateNow,
    resetResources,
    resourcesRef,
    ready,
  } = useResources(hexes);

  const { handleBuild, handleCancelBuild, processConstructionTick } =
    useConstruction(hexesRef, setHexes, resourcesRef, setResources);

  const { research, handleResearch, cancelResearch, processResearchTick } =
    useResearch(resourcesRef, setResources);

  const saveMapToStorage = async (map: Hex[]) => {
    setHexes(map);
    hexesRef.current = map;
    await saveMap(map);
  };

  const reloadMap = async () => {
    const saved = await loadMap();
    const normalized = saved ? normalizeHexMap(saved) : [];
    setHexes(normalized);
    hexesRef.current = normalized;
  };

  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      updateNow();
      processConstructionTick();
      processResearchTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [ready]);

  return (
    <ResourceContext.Provider
      value={{
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
        cancelResearch,
        processResearchTick,
        research,
        labLevel: getLabLevel(hexes),
      }}
    >
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
