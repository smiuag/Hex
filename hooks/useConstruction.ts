// hooks/useConstruction.ts
import { useRef } from "react";
import { Alert } from "react-native";
import { buildingConfig } from "../src/config/buildingConfig";
import { saveMap, saveResources } from "../src/services/storage";
import { BuildingType } from "../src/types/buildingTypes";
import { Hex } from "../src/types/hexTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getBuildTime } from "../utils/buildingUtils";
import { expandMapAroundBase } from "../utils/mapUtils";
import { NotificationManager } from "../utils/notificacionUtils";

import * as Notifications from "expo-notifications";
import {
  applyResourceChange,
  hasEnoughResources,
} from "../utils/resourceUtils";

export const useConstruction = (
  hexesRef: React.RefObject<Hex[]>,
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>,
  resourcesRef: React.RefObject<StoredResources>,
  setResources: React.Dispatch<React.SetStateAction<StoredResources>>
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
      const cost = buildingConfig[type].baseCost;

      const scaledCost: Partial<Resources> = {};
      for (const key in cost) {
        const typedKey = key as keyof Resources;
        scaledCost[typedKey] = (cost[typedKey] ?? 0) * nextLevel;
      }

      if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
        Alert.alert(
          "Recursos insuficientes",
          "No tienes suficientes materiales."
        );
        return;
      }

      const durationMs = getBuildTime(type, nextLevel);

      const notificationId = await NotificationManager.scheduleNotification({
        title: "✅ Construcción terminada",
        body: `Tu edificio "${type}" está listo.`,
        delayMs: durationMs,
      });

      // Actualizar recursos
      const updatedResources: StoredResources = {
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

      // Actualizar mapa
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

      setHexes(updatedHexes);
      hexesRef.current = updatedHexes;
      await saveMap(updatedHexes);
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

    const reimbursedResources: StoredResources = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        1
      ),
      lastUpdate: Date.now(),
    };

    setResources(reimbursedResources);
    resourcesRef.current = reimbursedResources;
    await saveResources(reimbursedResources);

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

    setHexes(updatedHexes);
    hexesRef.current = updatedHexes;
    await saveMap(updatedHexes);
  };

  const processConstructionTick = () => {
    console.log("tickConstruction");
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

            if (building === "base" && hex.q === 0 && hex.r === 0) {
              baseLeveledUp = true;
              updatedBaseLevel = targetLevel;
            }

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
        setHexes(finalMap);
        hexesRef.current = finalMap;
        saveMap(finalMap);
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
