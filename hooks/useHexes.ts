import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { buildingConfig } from "../src/config/buildingConfig";
import { deleteMap, loadMap, saveMap } from "../src/services/storage";
import { BuildingType } from "../src/types/buildingTypes";
import { Hex } from "../src/types/hexTypes";
import { Resources } from "../src/types/resourceTypes";
import { getBuildCost, getBuildTime, getProductionPerSecond } from "../utils/buildingUtils";
import { expandMapAroundBase, generateHexGrid, normalizeHexMap } from "../utils/hexUtils";
import { NotificationManager } from "../utils/notificacionUtils";

type UseHexesCallbacks = {
  onBuildStart?: (q: number, r: number, type: BuildingType, level: number) => void;
  onBuildComplete?: (q: number, r: number, type: BuildingType, level: number) => void;
  onBuildCancel?: (q: number, r: number, type: BuildingType, level: number) => void;
};

export const useHexes = (
  addProduction: (modifications: Partial<Resources>) => void,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean,
  callbacks?: UseHexesCallbacks
) => {
  const [hexes, setHexes] = useState<Hex[]>([]);

  const updateMap = async (updater: Hex[] | ((prev: Hex[]) => Hex[])) => {
    setHexes((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const normalized = normalizeHexMap(next);
      saveMap(normalized);
      return normalized;
    });
  };

  const loadInitialMap = async () => {
    const saved = await loadMap();
    if (saved) {
      updateMap(saved);
    } else {
      updateMap([]);
    }
  };

  useEffect(() => {
    loadInitialMap();
  }, []);

  const resetBuild = async () => {
    await deleteMap();

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

    updateMap(newMap);
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
          type: "info", // "success" | "info" | "error"
          text1: "Recursos insuficientes",
          position: "top",
          visibilityTime: 2000,
        });
        return prevHexes;
      }

      subtractResources(scaledCost);

      NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio "${type}" está listo.`,
        delayMs: durationMs,
      }).then((id) => {
        notificationId = id ?? undefined;
      });

      if (callbacks?.onBuildStart) {
        callbacks.onBuildStart(q, r, type, nextLevel);
      }

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

      if (callbacks?.onBuildCancel) {
        callbacks.onBuildCancel(q, r, building, targetLevel);
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
    const hexesToUpdate: Hex[] = [];
    let baseLeveledUp = false;
    let updatedBaseLevel = 0;
    let changed = false;

    const updatedHexes = hexes.map((hex) => {
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

      if (callbacks?.onBuildComplete) {
        callbacks.onBuildComplete(hex.q, hex.r, building, targetLevel);
      }

      if (building === "BASE" && hex.q === 0 && hex.r === 0) {
        baseLeveledUp = true;
        updatedBaseLevel = targetLevel;
      }

      Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Construcción terminada",
          body: `Tu edificio \"${building}\" ha finalizado su construcción.`,
          sound: true,
        },
        trigger: null,
      });

      const updatedHex: Hex = {
        ...hex,
        construction: undefined,
        building: {
          type: building,
          level: targetLevel,
        },
      };

      hexesToUpdate.push(updatedHex);
      return updatedHex;
    });

    if (changed) {
      const finalHexes = baseLeveledUp
        ? expandMapAroundBase(updatedHexes, updatedBaseLevel)
        : updatedHexes;

      updateMap(finalHexes);
    }
  };

  return {
    hexes,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
    resetBuild,
  };
};
