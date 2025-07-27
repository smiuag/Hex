import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { buildingConfig } from "../src/config/buildingConfig";
import { deleteMap, loadMap, saveMap } from "../src/services/storage";
import { BuildingType } from "../src/types/buildingTypes";
import { Hex } from "../src/types/hexTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getBuildCost, getBuildTime, getProductionPerSecond } from "../utils/buildingUtils";
import { expandMapAroundBase, generateHexGrid, normalizeHexMap } from "../utils/hexUtils";
import { NotificationManager } from "../utils/notificacionUtils";
import { hasEnoughResources } from "../utils/resourceUtils";

export const useHexes = (
  resources: StoredResources,
  addProduction: (modifications: Partial<Resources>) => void,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void
) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const isBuildingRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const saved = await loadMap();
      if (saved) updateMap(saved);
      else updateMap([]);
    };
    load();
  }, []);

  const updateMap = async (hexes: Hex[]) => {
    const normalized = normalizeHexMap(hexes);
    await saveMap(normalized);
    setHexes(normalized);
  };

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
    if (isBuildingRef.current) return;
    isBuildingRef.current = true;

    try {
      const hex = hexes.find((h) => h.q === q && h.r === r);
      if (!hex) return;

      const currentLevel = hex.building?.type === type ? hex.building.level : 0;
      const nextLevel = currentLevel + 1;
      const scaledCost = getBuildCost(type, nextLevel);
      const durationMs = getBuildTime(type, nextLevel);

      if (!hasEnoughResources(resources, scaledCost)) {
        Alert.alert("Recursos insuficientes", "No tienes suficientes materiales.");
        return;
      }

      const notificationId = await NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio "${type}" está listo.`,
        delayMs: durationMs,
      });

      subtractResources(scaledCost);

      const updatedHexes = hexes.map((h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              previousBuilding: h.building ?? null,
              construction: {
                building: type,
                startedAt: Date.now(),
                targetLevel: nextLevel,
                notificationId: notificationId ?? undefined,
              },
              building: null,
            }
          : h
      );

      updateMap(updatedHexes);
    } finally {
      isBuildingRef.current = false;
    }
  };

  const handleCancelBuild = async (q: number, r: number) => {
    const hex = hexes.find((h) => h.q === q && h.r === r);
    if (!hex || !hex.construction) return;

    const { building, targetLevel, notificationId } = hex.construction;
    const baseCost = buildingConfig[building].baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const typedKey = key as keyof Resources;
      scaledCost[typedKey] = (baseCost[typedKey] ?? 0) * targetLevel;
    }

    addResources(scaledCost);

    if (notificationId) {
      await NotificationManager.cancelNotification(notificationId);
    }

    const updatedHexes = hexes.map((h) => {
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

    updateMap(updatedHexes);
  };

  const processConstructionTick = () => {
    if (isBuildingRef.current) return;
    isBuildingRef.current = true;

    try {
      const now = Date.now();
      let changed = false;
      let baseLeveledUp = false;
      let updatedBaseLevel = 0;

      const updated = hexes.map((hex) => {
        if (hex.construction) {
          const { building, startedAt, targetLevel } = hex.construction;
          const buildTime = getBuildTime(building, targetLevel);

          if (now - startedAt >= buildTime) {
            changed = true;

            // Calcular producción anterior y nueva
            const prevProd: Partial<Resources> =
              targetLevel === 1 ? {} : getProductionPerSecond(building, targetLevel - 1);

            const newProd: Partial<Resources> = getProductionPerSecond(building, targetLevel);

            // Calcular diferencia
            const productionDiff: Partial<Resources> = {};
            const resourceTypes = new Set([
              ...Object.keys(prevProd),
              ...Object.keys(newProd),
            ]) as Set<keyof Resources>;

            for (const key of resourceTypes) {
              const before = prevProd[key] || 0;
              const after = newProd[key] || 0;
              const diff = after - before;
              if (diff !== 0) {
                productionDiff[key] = diff;
              }
            }

            // Aplicar producción si hay cambios
            if (Object.keys(productionDiff).length > 0) {
              addProduction(productionDiff);
            }

            if (building === "BASE" && hex.q === 0 && hex.r === 0) {
              baseLeveledUp = true;
              updatedBaseLevel = targetLevel;
            }

            // Notificación final de construcción
            Notifications.scheduleNotificationAsync({
              content: {
                title: "✅ Construcción terminada",
                body: `Tu edificio "${building}" ha finalizado su construcción.`,
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
          }
        }

        return hex;
      });

      let finalMap = updated;
      if (baseLeveledUp) {
        finalMap = expandMapAroundBase(updated, updatedBaseLevel);
      }

      if (changed) {
        updateMap(finalMap);
      }
    } finally {
      isBuildingRef.current = false;
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
