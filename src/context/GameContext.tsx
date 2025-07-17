import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { Resources, StoredResources } from "../../src/types/resourceTypes";
import {
  getBuildTime,
  getLabLevel,
  getResearchTime,
} from "../../utils/buildingUtils";
import {
  expandMapAroundBase,
  getInitialResources,
  normalizeHexMap,
} from "../../utils/mapUtils";
import { NotificationManager } from "../../utils/notificacionUtils";
import {
  accumulateResources,
  applyResourceChange,
  hasEnoughResources,
  resourcesAreEqual,
} from "../../utils/resourceUtils";
import { researchTechnologies } from "../config/researchConfig";
import {
  loadMap,
  loadResearchs,
  loadResources,
  saveMap,
  saveResearchs,
  saveResources,
} from "../services/storage";
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

const isBuildingRef = useRef(false);
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
  const [research, setResearch] = useState<Research[]>([]);
  const resourcesRef = useRef<StoredResources>(getInitialResources());
  const researchRef = useRef<Research[]>([]);

  const handleResearch = async (type: ResearchType) => {
    const existing = research.find((r) => r.type.type === type);

    // Si ya hay una investigación en curso, no se puede iniciar otra
    const researchInProgress = research.find((r) => r.progress);
    if (researchInProgress) return;

    const currentLevel = existing?.type.level ?? 0;
    const nextLevel = currentLevel + 1;
    const config = researchTechnologies[type];

    // Coste escalado
    const scaledCost: Partial<Resources> = {};
    for (const key in config.baseCost) {
      const k = key as keyof Resources;
      scaledCost[k] = (config.baseCost[k] ?? 0) * nextLevel;
    }

    if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
      Alert.alert(
        "Recursos insuficientes",
        "No puedes iniciar esta investigación."
      );
      return;
    }

    const durationMs = getResearchTime(type, nextLevel);

    const notificationId = await NotificationManager.scheduleNotification({
      title: "🧪 Investigación terminada",
      body: `Has completado "${type}" nivel ${nextLevel}.`,
      delayMs: durationMs,
    });

    const updatedResearch: Research[] = research.map((r) =>
      r.type.type === type
        ? {
            ...r,
            progress: {
              startedAt: Date.now(),
              targetLevel: nextLevel,
              notificationId: notificationId ?? undefined,
            },
          }
        : r
    );

    // Si no existe, añadir
    if (!existing) {
      updatedResearch.push({
        type: { type, level: 0 },
        progress: {
          startedAt: Date.now(),
          targetLevel: nextLevel,
          notificationId: notificationId ?? undefined,
        },
      });
    }

    setResearch(updatedResearch);
    researchRef.current = updatedResearch;
    await saveResearchs(updatedResearch);

    const updatedResources = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        -1
      ),
      lastUpdate: Date.now(),
    };

    setResources(updatedResources);
    resourcesRef.current = updatedResources;
    await saveResources(updatedResources);
  };

  const cancelResearch = async () => {
    const inProgress = research.find((r) => r.progress);
    if (!inProgress) return;

    const { type, progress } = inProgress;
    const config = researchTechnologies[type.type];
    const baseCost = config.baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const k = key as keyof Resources;
      scaledCost[k] = (baseCost[k] ?? 0) * progress!.targetLevel;
    }

    const refunded = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        1
      ),
      lastUpdate: Date.now(),
    };

    setResources(refunded);
    resourcesRef.current = refunded;
    await saveResources(refunded);

    if (progress!.notificationId) {
      await NotificationManager.cancelNotification(progress!.notificationId);
    }

    const updatedResearch = research.map((r) =>
      r.type.type === type.type ? { ...r, progress: undefined } : r
    );

    setResearch(updatedResearch);
    await saveResearchs(updatedResearch);
  };

  const saveMapToStorage = async (map: Hex[]) => {
    setHexes(map);
    hexesRef.current = map;
    await saveMap(map);
  };

  const processConstructionTick = () => {
    if (isBuildingRef.current) return;
    isBuildingRef.current = true;
    try {
      let baseLeveledUp = false;
      let updatedBaseLevel = 0;
      const now = Date.now();
      let changed = false;

      const updated = hexesRef.current.map((hex) => {
        if (hex.construction) {
          const { building, startedAt, targetLevel } = hex.construction;
          const buildTime = getBuildTime(building, targetLevel);

          if (now - startedAt >= buildTime) {
            changed = true;

            if (building === "base" && hex.q === 0 && hex.r === 0) {
              baseLeveledUp = true;
              updatedBaseLevel = targetLevel;
            }

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

      let finalMap = updated;

      if (baseLeveledUp) {
        finalMap = expandMapAroundBase(updated, updatedBaseLevel);
      }
      if (changed) {
        setHexes(finalMap);
        hexesRef.current = finalMap;
        saveMap(finalMap);
      }
    } finally {
      isBuildingRef.current = false;
    }
  };

  const reloadMap = async () => {
    const saved = await loadMap();
    const normalized = saved ? normalizeHexMap(saved) : [];
    setHexes(normalized);
    hexesRef.current = normalized;
  };

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
    if (isBuildingRef.current) return; // evitar dobles clics simultáneos
    isBuildingRef.current = true;

    try {
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

      if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
        Alert.alert(
          "Recursos insuficientes",
          "No tienes suficientes materiales para construir este edificio.",
          [{ text: "OK" }]
        );
        return;
      }

      const durationMs = getBuildTime(type, nextLevel);

      const notificationId = await NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio "${type}" ha finalizado su construcción.`,
        delayMs: durationMs,
      });

      // Aplicar cambios usando estado funcional
      setResources((prev) => {
        const updated: StoredResources = {
          ...prev,
          resources: applyResourceChange(prev.resources, scaledCost, -1),
          lastUpdate: Date.now(),
        };
        resourcesRef.current = updated;
        saveResources(updated);
        return updated;
      });

      setHexes((prev) => {
        const updated = prev.map((h) => {
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
        hexesRef.current = updated;
        saveMap(updated);
        return updated;
      });
    } finally {
      isBuildingRef.current = false;
    }
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

  const processResearchTick = () => {
    const now = Date.now();
    let changed = false;

    const updatedResearch = researchRef.current.map((item) => {
      if (item.progress) {
        const config = researchTechnologies[item.type.type];
        const totalTime = config.baseResearchTime;
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= totalTime) {
          // Investigación completada
          changed = true;

          // Notificar al usuario
          Notifications.scheduleNotificationAsync({
            content: {
              title: "🧠 Investigación completada",
              body: `Has finalizado la investigación "${config.name}".`,
              sound: true,
            },
            trigger: null,
          });

          return {
            type: {
              type: item.type.type,
              level: item.progress.targetLevel,
            },
          };
        }
      }

      return item;
    });

    if (changed) {
      setResearch(updatedResearch);
      researchRef.current = updatedResearch;
      saveResearchs(updatedResearch);
    }
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
      updateNow(); // Acumula recursos pasivos
      processConstructionTick(); // Finaliza construcciones si es necesario
      processResearchTick(); // Finaliza investigaciones si es necesario
    }, 1000);

    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    const load = async () => {
      const savedResearch = await loadResearchs();
      if (savedResearch) {
        setResearch(savedResearch);
      }
    };
    load();
  }, [hexes]);

  useEffect(() => {
    const load = async () => {
      const saved = await loadResearchs();
      if (saved) {
        setResearch(saved);
        researchRef.current = saved;
      } else {
        setResearch([]);
        researchRef.current = [];
      }
    };
    load();
  }, []);

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
