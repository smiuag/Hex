import { buildingConfig } from "@/src/config/buildingConfig";
import { deleteMap, loadMap, saveMap } from "@/src/services/storage";
import { BuildingType } from "@/src/types/buildingTypes";
import { Hex } from "@/src/types/hexTypes";
import { Resources } from "@/src/types/resourceTypes";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { getBuildCost, getBuildTime, getProductionPerSecond } from "../utils/buildingUtils";
import {
  expandHexMapFromBuiltHexes,
  generateInitialHexMap,
  recalculateHexMapVisibility,
} from "../utils/hexUtils";
import { NotificationManager } from "../utils/notificacionUtils";

export const useHexes = (
  addProduction: (modifications: Partial<Resources>) => void,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean
) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexRef = useRef<Hex[]>([]);

  const syncAndSave = (newHexes: Hex[]) => {
    hexRef.current = newHexes;
    setHexes(newHexes);
    saveMap(newHexes);
  };

  const updateMap = async (updater: Hex[] | ((prev: Hex[]) => Hex[])) => {
    setHexes((prev) => {
      const next = typeof updater === "function" ? updater(hexRef.current) : updater;
      syncAndSave(next);
      return next;
    });
  };

  const loadInitialMap = async () => {
    const saved = await loadMap();
    if (saved) {
      syncAndSave(saved);
    } else {
      syncAndSave([]);
    }
  };

  useEffect(() => {
    loadInitialMap();
  }, []);

  const resetBuild = async () => {
    await deleteMap();
    const newMap = generateInitialHexMap();
    syncAndSave(newMap);
  };

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
    let notificationId: string | undefined;

    await updateMap((prevHexes) => {
      const hex = prevHexes.find((h) => h.q === q && h.r === r);
      if (!hex) return prevHexes;

      const currentLevel = hex.building?.type === type ? hex.building.level : 0;
      const nextLevel = currentLevel + 1;
      const scaledCost = getBuildCost(type, nextLevel);
      const durationMs = getBuildTime(type, nextLevel);

      if (!enoughResources(scaledCost)) {
        Toast.show({
          type: "info",
          text1: "Recursos insuficientes",
          position: "top",
          visibilityTime: 2000,
        });
        return prevHexes;
      }

      subtractResources(scaledCost);

      NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio \"${type}\" está listo.`,
        delayMs: durationMs,
      }).then((id) => {
        notificationId = id ?? undefined;
      });

      return prevHexes.map((h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              previousBuilding: h.building ?? null,
              construction: {
                building: type,
                startedAt: Date.now(),
                targetLevel: nextLevel,
                notificationId,
              },
              building: null,
            }
          : h
      );
    });
  };

  const handleDestroyBuilding = async (q: number, r: number) => {
    const hex = hexRef.current.find((h) => h.q === q && h.r === r);
    if (!hex) return;

    const updatedHexes = hexRef.current.map((h) => {
      if (h.q === q && h.r === r) {
        return {
          ...h,
          building: null,
          previousBuilding: null,
          construction: undefined,
          isTerraformed: true,
        };
      }
      return h;
    });

    const recalculatedHexes = recalculateHexMapVisibility(updatedHexes);
    syncAndSave(recalculatedHexes);
  };

  const handleTerraform = async (q: number, r: number) => {
    const hex = hexRef.current.find((h) => h.q === q && h.r === r);
    if (!hex) return;

    const resources = hex.resources;

    const updated = hexRef.current.map((h) => {
      if (h.q === q && h.r === r) {
        return {
          ...h,
          resources: undefined,
          isTerraformed: true,
        };
      }
      return h;
    });

    syncAndSave(updated);

    if (resources) addResources(resources);
  };

  const handleCancelBuild = async (q: number, r: number) => {
    await updateMap((prevHexes) => {
      const hex = prevHexes.find((h) => h.q === q && h.r === r);
      if (!hex || !hex.construction) return prevHexes;

      const { building, targetLevel, notificationId } = hex.construction;
      const baseCost = buildingConfig[building].baseCost;

      const scaledCost: Partial<Resources> = {};
      for (const key in baseCost) {
        const typedKey = key as keyof Resources;
        scaledCost[typedKey] = (baseCost[typedKey] ?? 0) * targetLevel;
      }

      addResources(scaledCost);

      if (notificationId) {
        NotificationManager.cancelNotification(notificationId);
      }

      return prevHexes.map((h) => {
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
    });
  };

  const processConstructionTick = () => {
    const now = Date.now();
    let changed = false;

    const updatedHexes = hexRef.current.map((hex) => {
      if (!hex.construction) return hex;

      const { building, startedAt, targetLevel } = hex.construction;
      const buildTime = getBuildTime(building, targetLevel);

      if (now - startedAt < buildTime) return hex;

      changed = true;

      const prevProd =
        targetLevel === 1
          ? ({} as Partial<Resources>)
          : getProductionPerSecond(building, targetLevel - 1);
      const newProd = getProductionPerSecond(building, targetLevel);
      const diff: Partial<Resources> = {};

      const keys = new Set([...Object.keys(prevProd), ...Object.keys(newProd)]) as Set<
        keyof Resources
      >;
      for (const key of keys) {
        const before = prevProd[key] || 0;
        const after = newProd[key] || 0;
        const d = after - before;
        if (d !== 0) diff[key] = d;
      }

      if (Object.keys(diff).length > 0) addProduction(diff);

      Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Construcción terminada",
          body: `Tu edificio \"${building}\" ha finalizado su construcción.`,
          sound: true,
        },
        trigger: null,
      });

      return {
        ...hex,
        construction: undefined,
        building: {
          type: building,
          level: targetLevel,
        },
      };
    });

    if (changed) {
      const recalculated = expandHexMapFromBuiltHexes(updatedHexes);
      syncAndSave(recalculated);
    }
  };

  return {
    hexes,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
    resetBuild,
    handleTerraform,
    handleDestroyBuilding,
  };
};
