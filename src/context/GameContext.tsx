import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { buildingConfig } from "../../data/buildings";
import {
  BuildingType,
  Hex,
  Resources,
  StoredResources,
} from "../../data/tipos";
import { getBuildTime } from "../../utils/helpers";
import { getInitialResources } from "../../utils/mapGenerator";
import { normalizeHexMap } from "../../utils/mapNormalizer";
import {
  accumulateResources,
  applyResourceChange,
  hasEnoughResources,
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
    const hex = hexesRef.current.find((h) => h.q === q && h.r === r);
    if (!hex) return;

    const currentLevel = hex.building?.type === type ? hex.building.level : 0;
    const nextLevel = currentLevel + 1;
    const cost = buildingConfig[type].baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in cost) {
      const typedKey = key as keyof Resources;
      scaledCost[typedKey] = (cost[typedKey] ?? 0) * nextLevel;
    }

    // Verifica si hay recursos suficientes
    if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
      Alert.alert(
        "Recursos insuficientes",
        "No tienes suficientes materiales para construir este edificio.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log(resourcesRef.current);
    // Descuenta recursos
    const updatedResources = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        -1
      ),
      lastUpdate: Date.now(),
    };

    const updatedHexes = hexesRef.current.map((h) => {
      if (h.q === q && h.r === r) {
        return {
          ...h,
          previousBuilding: h.building ?? null,
          construction: {
            building: type,
            startedAt: Date.now(),
            targetLevel: nextLevel,
          },
          building: null,
        };
      }
      return h;
    });

    setHexes(updatedHexes);
    setResources(updatedResources);

    saveMap(updatedHexes);
    saveResources(updatedResources);
  };

  const handleCancelBuild = (q: number, r: number) => {
    const hex = hexesRef.current.find((h) => h.q === q && h.r === r);
    if (!hex || !hex.construction) return;

    const { building, targetLevel } = hex.construction;
    const baseCost = buildingConfig[building].baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const typedKey = key as keyof Resources;
      scaledCost[typedKey] = (baseCost[typedKey] ?? 0) * targetLevel;
    }

    // Reembolso
    const reimbursedResources = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        1
      ),
      lastUpdate: Date.now(),
    };

    const updatedHexes = hexesRef.current.map((h) => {
      if (h.q === q && h.r === r) {
        const { construction, previousBuilding, ...rest } = h;
        return {
          ...rest,
          construction: undefined,
          building: previousBuilding ?? null,
          previousBuilding: undefined,
        };
      }
      return h;
    });

    setHexes(updatedHexes);
    setResources(reimbursedResources);

    saveMap(updatedHexes);
    saveResources(reimbursedResources);
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
