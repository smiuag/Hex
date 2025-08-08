import { buildingConfig } from "@/src/config/buildingConfig";
import { deleteMap, loadMap, saveMap } from "@/src/services/storage";
import { BuildingType } from "@/src/types/buildingTypes";
import { ConfigEntry } from "@/src/types/configTypes";
import { Hex } from "@/src/types/hexTypes";
import { UpdateQuestOptions } from "@/src/types/questType";
import { Resources } from "@/src/types/resourceTypes";
import { TerrainType } from "@/src/types/terrainTypes";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { getBuildCost, getBuildTime, getProductionPerSecond } from "../utils/buildingUtils";
import {
  expandHexMapFromBuiltHexes,
  generateInitialHexMap,
  recalculateHexMapVisibility,
} from "../utils/hexUtils";

export const useHexes = (
  addProduction: (modifications: Partial<Resources>, effectiveAt: number) => void,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean,
  handleUpdateConfig: (config: ConfigEntry) => void,
  updateQuest: (options: UpdateQuestOptions) => void
) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexRef = useRef<Hex[]>([]);

  const updateHexes = async (newHexes: Hex[]) => {
    const prev = hexRef.current;

    const isEqual = prev === newHexes || JSON.stringify(prev) === JSON.stringify(newHexes);
    if (isEqual) return;

    hexRef.current = newHexes;
    setHexes(newHexes);
    await saveMap(newHexes);
  };

  const modifyHexes = async (modifier: (prev: Hex[]) => Hex[]) => {
    const next = modifier(hexRef.current);
    await updateHexes(next);
  };

  const loadInitialMap = async () => {
    const saved = await loadMap();
    if (saved) {
      await updateHexes(saved);
    } else {
      await updateHexes([]);
    }
  };

  useEffect(() => {
    loadInitialMap();
  }, []);

  const resetBuild = async () => {
    await deleteMap();
    await modifyHexes(() => generateInitialHexMap());
  };

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
    //let notificationId: string | undefined;

    await modifyHexes((prevHexes) => {
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

      // NotificationManager.scheduleNotification({
      //   title: "✅ Construcción terminada",
      //   body: `Tu edificio \"${type}\" está listo.`,
      //   delayMs: durationMs,
      // }).then((id) => {
      //   notificationId = id ?? undefined;
      // });

      return prevHexes.map((h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              previousBuilding: h.building ?? null,
              construction: {
                building: type,
                startedAt: Date.now(),
                targetLevel: nextLevel,
                // notificationId,
              },
              building: null,
            }
          : h
      );
    });
  };

  const handleDestroyBuilding = async (q: number, r: number) => {
    await modifyHexes((prev) => {
      const updatedHexes = prev.map((h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              building: null,
              previousBuilding: null,
              construction: undefined,
              isTerraformed: true,
            }
          : h
      );
      return recalculateHexMapVisibility(updatedHexes);
    });
  };
  const setHexAncientStructure = async (hex: Hex) => {
    await modifyHexes((prev) => {
      const updatedHexes = prev.map((h) =>
        h.q === hex.q && h.r === hex.r
          ? {
              ...h,
              building: null,
              previousBuilding: null,
              construction: undefined,
              isTerraformed: true,
              terrain: "ANCIENT_ALIEN_STRUCTURES" as TerrainType,
            }
          : h
      );

      return recalculateHexMapVisibility(updatedHexes);
    });

    await handleUpdateConfig({ key: "ALIEN_STRUCTURE_FOUND", value: "true" });
    await updateQuest({ type: "ALIEN_TECH_FOUND", completed: true });
  };

  const handleTerraform = async (q: number, r: number) => {
    const targetHex = hexRef.current.find((h) => h.q === q && h.r === r);
    if (!targetHex) return;

    const resources = targetHex.resources;

    await modifyHexes((prev) =>
      prev.map((h) =>
        h.q === q && h.r === r ? { ...h, resources: undefined, isTerraformed: true } : h
      )
    );

    //if (resources) addResources(resources);
  };

  const handleCancelBuild = async (q: number, r: number) => {
    await modifyHexes((prevHexes) => {
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
      //if (notificationId) NotificationManager.cancelNotification(notificationId);

      return prevHexes.map((h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              construction: undefined,
              building: h.previousBuilding ?? null,
              previousBuilding: undefined,
            }
          : h
      );
    });
  };

  const processConstructionTick = async () => {
    let antennaBuild = false;
    let hangarBuild = false;
    let quarryBuild = false;
    let metalBuild = false;
    let krystalmineBuild = false;
    let baseBuild = false;
    let labBuild = false;
    let waterExtractorBuild = false;

    const completed: Array<{
      diff: Partial<Resources>;
      finishedAt: number;
      building: BuildingType;
    }> = [];

    await modifyHexes((prevHexes) => {
      const now = Date.now();
      let changed = false;

      const updatedHexes = prevHexes.map((hex) => {
        if (!hex.construction) return hex;

        const { building, startedAt, targetLevel } = hex.construction;
        const buildTime = getBuildTime(building, targetLevel);

        const finishedAt = startedAt + buildTime;
        if (now < finishedAt) return hex;

        changed = true;

        const prevProd: Partial<Resources> =
          targetLevel === 1 ? {} : getProductionPerSecond(building, targetLevel - 1);
        const newProd: Partial<Resources> = getProductionPerSecond(building, targetLevel);
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

        if (Object.keys(diff).length > 0) {
          completed.push({ diff, finishedAt, building });
        }

        if (building === "QUARRY") quarryBuild = true;
        if (building === "METALLURGY") metalBuild = true;
        if (building === "KRYSTALMINE") krystalmineBuild = true;
        if (building === "BASE") baseBuild = true;
        if (building === "ANTENNA") antennaBuild = true;
        if (building === "HANGAR") hangarBuild = true;
        if (building === "LAB") labBuild = true;
        if (building === "WATEREXTRACTOR") waterExtractorBuild = true;

        return {
          ...hex,
          construction: undefined,
          building: {
            type: building,
            level: targetLevel,
          },
        };
      });

      return changed ? expandHexMapFromBuiltHexes(updatedHexes) : prevHexes;
    });

    if (completed.length) {
      completed.sort((a, b) => a.finishedAt - b.finishedAt);
      for (const c of completed) {
        await addProduction(c.diff, c.finishedAt);
      }
    }
    //config para mostrar tabs
    if (antennaBuild) await handleUpdateConfig({ key: "HAS_ANTENNA", value: "true" });
    if (hangarBuild) await handleUpdateConfig({ key: "HAS_HANGAR", value: "true" });

    //update de quests
    if (labBuild) await updateQuest({ type: "BUILDING_LAB1", completed: true });
    if (quarryBuild) await updateQuest({ type: "BUILDING_QUARRY1", completed: true });
    if (metalBuild) await updateQuest({ type: "BUILDING_METALLURGY1", completed: true });
    if (krystalmineBuild) await updateQuest({ type: "BUILDING_KRYSTALMINE1", completed: true });
    if (baseBuild) await updateQuest({ type: "BUILDING_BASE2", completed: true });
    if (antennaBuild) await updateQuest({ type: "BUILDING_ANTENNA", completed: true });
    if (hangarBuild) await updateQuest({ type: "BUILDING_HANGAR", completed: true });
    if (waterExtractorBuild) await updateQuest({ type: "H2O_FOUND", completed: true });
  };

  return {
    hexes,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
    resetBuild,
    handleTerraform,
    handleDestroyBuilding,
    setHexAncientStructure,
  };
};
