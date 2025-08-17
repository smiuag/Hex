import { buildingConfig } from "@/src/config/buildingConfig";
import { deleteMap, loadMap, saveMap } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { BuildingType } from "@/src/types/buildingTypes";
import { ConfigEntry } from "@/src/types/configTypes";
import { Hex } from "@/src/types/hexTypes";
import { UpdateQuestOptions } from "@/src/types/questType";
import { CombinedResources, Resources } from "@/src/types/resourceTypes";
import { TerrainType } from "@/src/types/terrainTypes";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { getBuildCost, getBuildTime, getProductionPerSecond } from "../utils/buildingUtils";
import {
  expandHexMapFromBuiltHexes,
  generateInitialHexMap,
  recalculateHexMapVisibility,
} from "../utils/hexUtils";

export const useHexes = (
  addProduction: (modifications: Partial<CombinedResources>, effectiveAt: number) => void,
  addResources: (modifications: Partial<CombinedResources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean,
  handleUpdateConfig: (config: ConfigEntry) => void,
  updateQuest: (options: UpdateQuestOptions) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexRef = useRef<Hex[]>([]);

  const router = useRouter();

  // Cola para serializar guardados y evitar escrituras fuera de orden
  const saveChain = useRef(Promise.resolve());
  // Evita re-guardar justo tras hidratar
  const hydrated = useRef(false);

  // Persistir en serie cada cambio de 'hexes'
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const snapshot = hexRef.current;
    saveChain.current = saveChain.current
      .then(() => saveMap(snapshot))
      .catch((e) => console.error("Error saving map:", e));
  }, [hexes]);

  // Cargar mapa inicial
  const loadInitialMap = async () => {
    const saved = await loadMap();
    if (saved) {
      hexRef.current = saved;
      setHexes(saved);
    } else {
      const initial: Hex[] = [];
      hexRef.current = initial;
      setHexes(initial);
    }
  };

  useEffect(() => {
    loadInitialMap();
  }, []);

  // Helper para mapear detectando si cambió algo (por referencia)
  const mapWithChange = <T>(
    arr: T[],
    fn: (x: T, i: number) => T
  ): { next: T[]; changed: boolean } => {
    let changed = false;
    const next = arr.map((x, i) => {
      const y = fn(x, i);
      if (y !== x) changed = true;
      return y;
    });
    return { next, changed };
  };

  // Helper: modificar a partir del estado previo con short-circuit si no cambia
  const modifyHexes = (modifier: (prev: Hex[]) => Hex[]) => {
    setHexes((prev) => {
      const next = modifier(prev);
      if (next === prev) return prev; // ← evita re-render si no hay cambios
      hexRef.current = next;
      return next;
    });
  };

  const resetBuild = async () => {
    await deleteMap();
    modifyHexes(() => generateInitialHexMap());
  };

  const handleBuild = async (q: number, r: number, type: BuildingType) => {
    //let notificationId: string | undefined;
    modifyHexes((prevHexes) => {
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

      // NotificationManager.scheduleNotification({...durationMs}).then(id => { notificationId = id ?? undefined; });

      const { next, changed } = mapWithChange(prevHexes, (h) =>
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
      return changed ? next : prevHexes;
    });
  };

  const handleDestroyBuilding = async (q: number, r: number) => {
    modifyHexes((prev) => {
      const { next, changed } = mapWithChange(prev, (h) =>
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
      // Si no cambia nada, devolvemos prev (no recomputamos visibilidad)
      return changed ? recalculateHexMapVisibility(next) : prev;
    });
  };

  const setHexAncientStructure = async (hex: Hex) => {
    modifyHexes((prev) => {
      const { next, changed } = mapWithChange(prev, (h) =>
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
      return changed ? recalculateHexMapVisibility(next) : prev;
    });

    await handleUpdateConfig({ key: "ALIEN_STRUCTURE_FOUND", value: "true" });
    await updateQuest({ type: "ALIEN_TECH_FOUND", completed: true });
    onAchievementEvent({ type: "trigger", key: "ALIEN_TECH_FOUND" });
  };

  const handleTerraform = async (q: number, r: number) => {
    const targetHex = hexRef.current.find((h) => h.q === q && h.r === r);
    if (!targetHex) return;

    let didChange = false;
    modifyHexes((prev) => {
      const { next, changed } = mapWithChange(prev, (h) =>
        h.q === q && h.r === r ? { ...h, resources: undefined, isTerraformed: true } : h
      );
      didChange = changed;
      return changed ? next : prev;
    });

    if (didChange) {
      onAchievementEvent({ type: "increment", key: "TILES_TERRAFORMED", amount: 1 });
      if (targetHex.resources) addResources(targetHex.resources);
    }
  };

  const handleCancelBuild = async (q: number, r: number) => {
    // Mantén la semántica original: solo si existe una construcción, reembolsa y cambia
    const hex = hexRef.current.find((h) => h.q === q && h.r === r);
    if (!hex || !hex.construction) return;

    const { building, targetLevel /*, notificationId */ } = hex.construction;
    const baseCost = buildingConfig[building].baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const typedKey = key as keyof Resources;
      scaledCost[typedKey] = (baseCost[typedKey] ?? 0) * targetLevel;
    }
    addResources(scaledCost);
    // if (notificationId) NotificationManager.cancelNotification(notificationId);

    modifyHexes((prevHexes) => {
      const { next, changed } = mapWithChange(prevHexes, (h) =>
        h.q === q && h.r === r
          ? {
              ...h,
              construction: undefined,
              building: h.previousBuilding ?? null,
              previousBuilding: undefined,
            }
          : h
      );
      return changed ? next : prevHexes;
    });
  };

  const stopConstruction = async () => {
    modifyHexes((prev) => {
      const { next, changed } = mapWithChange(prev, (h) => {
        if (!h.construction) return h;
        return {
          ...h,
          construction: undefined,
          building: h.previousBuilding ?? null,
          previousBuilding: undefined,
        };
      });
      return changed ? next : prev;
    });
  };

  const bombingSystem = async () => {
    modifyHexes((prev) => {
      const { next, changed } = mapWithChange(prev, (h) => {
        if (
          h.building?.type == "ENERGY" ||
          h.building?.type == "QUARRY" ||
          h.building?.type == "METALLURGY" ||
          h.building?.type == "KRYSTALMINE"
        ) {
          if (Math.random() < 0.5) {
            if (h.construction)
              return {
                ...h,
                construction: undefined,
                building: h.previousBuilding ?? null,
                previousBuilding: undefined,
              };
            else if (!h.building) return h; // no building, no change
            else if (h.building.level == 1)
              return {
                ...h,
                construction: undefined,
                building: null,
                previousBuilding: undefined,
              };
            else
              return {
                ...h,
                construction: undefined,
                building: { ...h.building, level: h.building.level - 1 },
                previousBuilding: undefined,
              };
          }
        }
        return h;
      });
      return changed ? next : prev;
    });
  };

  // ✅ Construcciones completadas → logros
  const processConstructionTick = async () => {
    let antennaBuild = false;
    let hangarBuild = false;
    let quarryBuild = false;
    let metalBuild = false;
    let krystalmineBuild = false;
    let baseBuild = false;
    let labBuild = false;
    let waterExtractorBuild = false;
    let alienLabBuild = false;
    let embassyBuild = false;

    // NUEVOS acumuladores para logros
    let quarriesBuiltCount = 0;
    let metallurgyBuiltCount = 0;
    let upgradesCount = 0;
    let baseReachedL2 = false;
    let baseReachedL3 = false;
    let antennaReachedMax = false;

    const completed: Array<{
      diff: Partial<CombinedResources>;
      finishedAt: number;
      building: BuildingType;
    }> = [];

    modifyHexes((prevHexes) => {
      const now = Date.now();
      let changed = false;

      const updatedHexes = prevHexes.map((hex) => {
        if (!hex.construction) return hex;

        const { building, startedAt, targetLevel } = hex.construction;
        const buildTime = getBuildTime(building, targetLevel);

        const finishedAt = startedAt + buildTime;
        if (now < finishedAt) return hex;

        changed = true;

        // produc / diff
        const prevProd: Partial<CombinedResources> =
          targetLevel === 1 ? {} : getProductionPerSecond(building, targetLevel - 1);
        const newProd: Partial<CombinedResources> = getProductionPerSecond(building, targetLevel);
        const diff: Partial<CombinedResources> = {};
        const keys = new Set([...Object.keys(prevProd), ...Object.keys(newProd)]) as Set<
          keyof CombinedResources
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

        // flags existentes
        if (targetLevel == 1) {
          if (building === "QUARRY") {
            quarryBuild = true;
            quarriesBuiltCount += 1;
          }
          if (building === "METALLURGY") {
            metalBuild = true;
            metallurgyBuiltCount += 1;
          }
          if (building === "KRYSTALMINE") krystalmineBuild = true;
          if (building === "ANTENNA") antennaBuild = true;
          if (building === "HANGAR") hangarBuild = true;
          if (building === "LAB") {
            labBuild = true;
          }
          if (building === "WATEREXTRACTOR") {
            waterExtractorBuild = true;
          }
          if (building === "ALIEN_LAB") alienLabBuild = true;
          if (building === "EMBASSY") embassyBuild = true;
        } else {
          // cualquier edificio que sube a >1 cuenta como "upgrade"
          upgradesCount += 1;
        }

        if (building === "BASE") {
          baseBuild = true;
          if (targetLevel >= 2) baseReachedL2 = true;
          if (targetLevel >= 3) baseReachedL3 = true;
        }

        // antena a nivel máximo
        if (building === "ANTENNA") {
          const maxLv = buildingConfig.ANTENNA?.maxLvl ?? undefined;
          if (maxLv && targetLevel >= maxLv) antennaReachedMax = true;
        }

        return {
          ...hex,
          construction: undefined,
          previousBuilding: undefined,
          building: { type: building, level: targetLevel },
        };
      });

      return changed ? expandHexMapFromBuiltHexes(updatedHexes) : prevHexes;
    });

    // producción diferida
    if (completed.length) {
      completed.sort((a, b) => a.finishedAt - b.finishedAt);
      for (const c of completed) {
        await addProduction(c.diff, c.finishedAt);
      }
    }

    // === Config para tabs (igual que tenías) ===
    if (antennaBuild) await handleUpdateConfig({ key: "HAS_ANTENNA", value: "true" });
    if (hangarBuild) await handleUpdateConfig({ key: "HAS_HANGAR", value: "true" });
    if (embassyBuild) await handleUpdateConfig({ key: "HAS_EMBASSY", value: "true" });

    // === Quests ===
    if (labBuild) await updateQuest({ type: "BUILDING_LAB1", completed: true });
    if (quarryBuild) await updateQuest({ type: "BUILDING_QUARRY1", completed: true });
    if (metalBuild) await updateQuest({ type: "BUILDING_METALLURGY1", completed: true });
    if (krystalmineBuild) await updateQuest({ type: "BUILDING_KRYSTALMINE1", completed: true });
    if (baseBuild) await updateQuest({ type: "BUILDING_BASE2", completed: true });
    if (waterExtractorBuild) await updateQuest({ type: "H2O_FOUND", completed: true });
    if (alienLabBuild) await updateQuest({ type: "BUILDING_ALIEN_LAB", completed: true });
    if (embassyBuild) await updateQuest({ type: "BUILDING_EMBASSY", completed: true });

    if (antennaBuild) {
      await updateQuest({ type: "BUILDING_ANTENNA", completed: true });
      Alert.alert("Galaxia", "Una nueva opción del menú desbloqueada", [
        { text: "cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            router.replace("/(tabs)/galaxy");
          },
        },
      ]);
    }
    if (hangarBuild) {
      await updateQuest({ type: "BUILDING_HANGAR", completed: true });
      Alert.alert("Naves", "Una nueva opción del menú desbloqueada", [
        { text: "cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            router.replace("/(tabs)/ship");
          },
        },
      ]);
    }

    // === 🔔 LOGROS ===
    // booleanos
    if (labBuild) onAchievementEvent({ type: "trigger", key: "FIRST_LAB" });
    if (embassyBuild) onAchievementEvent({ type: "trigger", key: "ESTABLISH_EMBASSY" });
    if (waterExtractorBuild) onAchievementEvent({ type: "trigger", key: "H2O_FOUND" });
    if (baseReachedL2) onAchievementEvent({ type: "trigger", key: "BASE_LEVEL_2" });
    if (baseReachedL3) onAchievementEvent({ type: "trigger", key: "BASE_LEVEL_3" });
    if (antennaReachedMax) onAchievementEvent({ type: "trigger", key: "MAX_LEVEL_ANTENNA" });

    // contadores
    if (quarriesBuiltCount > 0) {
      onAchievementEvent({ type: "increment", key: "QUARRIES_BUILT", amount: quarriesBuiltCount });
    }
    if (metallurgyBuiltCount > 0) {
      onAchievementEvent({
        type: "increment",
        key: "METALLURGY_BUILT",
        amount: metallurgyBuiltCount,
      });
    }
    if (upgradesCount > 0) {
      onAchievementEvent({ type: "increment", key: "BUILDINGS_UPGRADED", amount: upgradesCount });
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
    setHexAncientStructure,
    stopConstruction,
    bombingSystem,
  };
};
