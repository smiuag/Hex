import React, { useRef } from "react";
import { Alert } from "react-native";
import { buildingConfig } from "../src/config/buildingConfig";
import { saveMap } from "../src/services/storage";
import { BuildingType } from "../src/types/buildingTypes";
import { Hex } from "../src/types/hexTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import {
  getBuildCost,
  getBuildTime,
  getProductionPerSecond,
} from "../utils/buildingUtils";
import { expandMapAroundBase } from "../utils/mapUtils";
import { NotificationManager } from "../utils/notificacionUtils";

import * as Notifications from "expo-notifications";
import { hasEnoughResources } from "../utils/resourceUtils";

export const useConstruction = (
  hexesRef: React.RefObject<Hex[]>,
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>,
  resources: StoredResources,
  addProduction: (modifications: Partial<Resources>) => void,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  reloadMap: () => Promise<void>
) => {
  const isBuildingRef = useRef(false);

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
    if (isBuildingRef.current) return;
    isBuildingRef.current = true;

    try {
      const hex = hexesRef.current.find((h) => h.q === q && h.r === r);
      if (!hex) return;

      const currentLevel = hex.building?.type === type ? hex.building.level : 0;
      const nextLevel = currentLevel + 1;
      const scaledCost = getBuildCost(type, nextLevel);
      const durationMs = getBuildTime(type, nextLevel);

      if (!hasEnoughResources(resources, scaledCost)) {
        Alert.alert(
          "Recursos insuficientes",
          "No tienes suficientes materiales."
        );
        return;
      }

      const notificationId = await NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio "${type}" está listo.`,
        delayMs: durationMs,
      });

      subtractResources(scaledCost);

      const updatedHexes = hexesRef.current.map((h) =>
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

      hexesRef.current = [...updatedHexes];
      setHexes([...updatedHexes]);
      saveMap(updatedHexes);
    } finally {
      isBuildingRef.current = false;
    }
  };

  const handleCancelBuild = async (q: number, r: number) => {
    const hex = hexesRef.current.find((h) => h.q === q && h.r === r);
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

    hexesRef.current = [...updatedHexes];
    setHexes([...updatedHexes]);
    await saveMap(updatedHexes);
  };

  const processConstructionTick = () => {
    if (isBuildingRef.current) return;
    isBuildingRef.current = true;

    try {
      const now = Date.now();
      let changed = false;
      let baseLeveledUp = false;
      let updatedBaseLevel = 0;

      const updated = hexesRef.current.map((hex) => {
        if (hex.construction) {
          const { building, startedAt, targetLevel } = hex.construction;
          const buildTime = getBuildTime(building, targetLevel);

          if (now - startedAt >= buildTime) {
            changed = true;

            // Calcular producción anterior y nueva
            const prevProd: Partial<Resources> =
              targetLevel === 1
                ? {}
                : getProductionPerSecond(building, targetLevel - 1);

            const newProd: Partial<Resources> = getProductionPerSecond(
              building,
              targetLevel
            );

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
        hexesRef.current = [...finalMap];
        setHexes([...finalMap]);
        saveMap(finalMap);

        if (baseLeveledUp) {
          reloadMap();
        }
      }
    } finally {
      isBuildingRef.current = false;
    }
  };

  return {
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
  };
};
