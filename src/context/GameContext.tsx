import * as Notifications from "expo-notifications";
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
import { getBuildTime } from "../../utils/buildingUtils";
import { getInitialResources, normalizeHexMap } from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";
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
  resetResources: () => void;
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

          // ⚠️ NUEVO: Notificar al usuario
          Notifications.scheduleNotificationAsync({
            content: {
              title: "✅ Construcción terminada",
              body: `Tu edificio "${building}" ha finalizado su construcción.`,
              sound: true,
            },
            trigger: null, // se muestra inmediatamente
          });

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

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
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

    // Obtener duración de construcción
    const durationMs = getBuildTime(type, nextLevel);

    // Programar notificación si procede
    const notificationId = await NotificationManager.scheduleNotification({
      title: "✅ Construcción terminada",
      body: `Tu edificio "${type}" ha finalizado su construcción.`,
      delayMs: durationMs,
    });

    // Actualizar el mapa con la construcción y el notificationId
    const updatedHexes = hexesRef.current.map((h) => {
      if (h.q === q && h.r === r) {
        return {
          ...h,
          previousBuilding: h.building ?? null,
          construction: {
            building: type,
            startedAt: Date.now(),
            targetLevel: nextLevel,
            notificationId: notificationId ?? undefined,
          },
          building: null,
        };
      }
      return h;
    });

    setHexes(updatedHexes);
    setResources(updatedResources);

    await saveMap(updatedHexes);
    await saveResources(updatedResources);
  };

  const resetResources = async () => {
    setReady(false);
    setResources(getInitialResources());
    saveResources(getInitialResources());
    resources;
  };

  const handleCancelBuild = async (q: number, r: number) => {
    const hex = hexesRef.current.find((h) => h.q === q && h.r === r);
    if (!hex || !hex.construction) return;

    const { building, targetLevel, notificationId } = hex.construction;
    const baseCost = buildingConfig[building].baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const k = key as keyof Resources;
      scaledCost[k] = (baseCost[k] ?? 0) * targetLevel;
    }

    // Reembolsar recursos
    const reimbursedResources: StoredResources = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        1
      ),
      lastUpdate: Date.now(),
    };

    // Cancelar notificación si existe
    if (notificationId) {
      await NotificationManager.cancelNotification(notificationId);
    }

    // Actualizar mapa
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

    await saveMap(updatedHexes);
    await saveResources(reimbursedResources);
  };

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  const updateNow = () => {
    if (!ready) return null;
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
        resetResources,
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
