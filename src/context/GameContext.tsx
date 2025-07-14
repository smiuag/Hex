import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BuildingType, Hex, StoredResources } from "../../data/tipos";
import { getBuildTime } from "../../utils/helpers";
import { getInitialResources } from "../../utils/mapGenerator";
import { normalizeHexMap } from "../../utils/mapNormalizer";
import {
  accumulateResources,
  resourcesAreEqual,
} from "../../utils/resourceUtils";
import {
  loadMap,
  loadResources,
  saveMap,
  saveResources,
} from "../services/storage";

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
};

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexesRef = useRef<Hex[]>([]);

  const [ready, setReady] = useState(false);
  const [resources, setResources] = useState<StoredResources>(
    getInitialResources()
  );
  const resourcesRef = useRef<StoredResources>(getInitialResources());
  const saveMapToStorage = async (map: Hex[]) => {
    setHexes(map);
    hexesRef.current = map;
    await saveMap(map);
  };
  const processConstructionTick = () => {
    const now = Date.now();
    let changed = false;

    const updated = hexesRef.current.map((hex) => {
      if (hex.construction) {
        const { building, startedAt, targetLevel } = hex.construction;
        const buildTime = getBuildTime(building, targetLevel);

        if (now - startedAt >= buildTime) {
          changed = true;
          return {
            ...hex,
            construction: undefined,
            building: {
              type: building,
              level: targetLevel,
            },
          };
        }
      }
      return hex;
    });

    if (changed) {
      setHexes(updated);
      hexesRef.current = updated;
      saveMap(updated);
    }
  };
  const reloadMap = async () => {
    const saved = await loadMap();
    const normalized = saved ? normalizeHexMap(saved) : [];
    setHexes(normalized);
    hexesRef.current = normalized;
  };

  useEffect(() => {
    reloadMap();
    const interval = setInterval(() => {
      processConstructionTick();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuild = (q: number, r: number, type: BuildingType) => {
    const updated = hexes.map((hex) => {
      if (hex.q === q && hex.r === r) {
        const currentLevel =
          hex.building?.type === type ? hex.building.level : 0;
        return {
          ...hex,
          previousBuilding: hex.building ?? null,
          construction: {
            building: type,
            startedAt: Date.now(),
            targetLevel: currentLevel + 1,
          },
          building: null,
        };
      }
      return hex;
    });

    setHexes(updated);
    saveMapToStorage(updated);
  };

  const handleCancelBuild = async (q: number, r: number) => {
    const updated = hexes.map((hex) => {
      if (hex.q === q && hex.r === r) {
        const { construction, previousBuilding, ...rest } = hex;
        return {
          ...rest,
          construction: undefined,
          building: previousBuilding ?? null,
          previousBuilding: undefined,
        };
      }
      return hex;
    });

    setHexes(updated);
    await saveMapToStorage(updated);
  };

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  const updateNow = () => {
    const updated = accumulateResources(hexes, resourcesRef.current);

    if (!resourcesAreEqual(updated, resourcesRef.current)) {
      setResources(updated);
      resourcesRef.current = updated;
      saveResources(updated); // solo se guarda si cambió
    }
  };

  // Carga inicial
  useEffect(() => {
    if (hexes.length === 0) return;

    const load = async () => {
      const saved = await loadResources();

      if (saved) {
        const now = Date.now();
        const diff = now - saved.lastUpdate;

        const updated =
          diff > 1000 ? accumulateResources(hexes, saved, diff) : saved;

        setResources(updated);
        resourcesRef.current = updated;
        if (diff > 1000) {
          await saveResources(updated); // solo guarda si se recalculó
        }
      } else {
        const initial = getInitialResources();
        setResources(initial);
        resourcesRef.current = initial;
        await saveResources(initial);
      }

      setReady(true);
    };

    load();
  }, [hexes]);

  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      updateNow();
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, hexes]);

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
