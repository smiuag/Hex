// useResearch.ts
import { researchConfig } from "@/src/config/researchConfig";
import { loadResearch, saveResearch } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { UpdateQuestOptions } from "@/src/types/questType";
import { Research, ResearchType } from "@/src/types/researchTypes";
import { CombinedResources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  getNextDiscoverableResearchType,
  getResearchCost,
  getResearchTime,
} from "../utils/researchUtils";

export const useResearch = (
  addResources: (mod: Partial<CombinedResources>) => void,
  subtractResources: (mod: Partial<CombinedResources>) => void,
  enoughResources: (cost: Partial<CombinedResources>) => boolean,
  updateQuest: (options: UpdateQuestOptions) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [research, setResearch] = useState<Research[]>([]);
  const researchRef = useRef<Research[]>([]);

  // Cola para serializar guardados + flag de hidratación
  const saveChain = useRef(Promise.resolve());
  const hydrated = useRef(false);

  // Persistir en serie cada cambio
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const snapshot = researchRef.current;
    saveChain.current = saveChain.current
      .then(() => saveResearch(snapshot))
      .catch((e) => console.error("Error saving research:", e));
  }, [research]);

  // Carga inicial
  const loadData = async () => {
    const saved = await loadResearch();
    if (saved) {
      researchRef.current = saved;
      setResearch(saved);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // Utilidad: mapea detectando si cambió algo
  const mapWithChange = <T>(
    arr: T[],
    fn: (x: T, i: number) => T
  ): { next: T[]; changed: boolean } => {
    let changed = false;
    const next = arr.map((x, i) => {
      const y = fn(x, i);
      if (y !== x) changed = true; // referencia distinta = cambió
      return y;
    });
    return { next, changed };
  };

  // Helper: modificar desde el estado previo (y mantener el ref sincronizado)
  const modifyResearch = (
    modifier: (prev: Research[]) => Research[] | { next: Research[]; changed?: boolean }
  ) => {
    setResearch((prev) => {
      const result = modifier(prev as Research[]);
      const next = (result as any)?.next
        ? ((result as any).next as Research[])
        : (result as Research[]);
      // Si el caller quiere saltarse el set, que devuelva exactamente 'prev'
      if (next === prev) return prev;
      researchRef.current = next;
      return next;
    });
  };

  const resetResearch = async () => {
    modifyResearch(() => (researchRef.current.length ? [] : researchRef.current));
  };

  const handleResearch = async (type: ResearchType) => {
    const currentLevel = researchRef.current.find((r) => r.data.type === type)?.data.level ?? 0;
    const nextLevel = currentLevel + 1;
    const scaledCost = getResearchCost(type, nextLevel);
    // const durationMs = getResearchTime(type, nextLevel); // no usado aquí

    if (!enoughResources(scaledCost)) {
      Toast.show({
        type: "info",
        text1: "Recursos insuficientes",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    modifyResearch((prev) => {
      const existing = prev.find((r) => r.data.type === type);
      if (existing) {
        const { next, changed } = mapWithChange(prev, (r) =>
          r.data.type === type
            ? {
                ...r,
                progress: { startedAt: Date.now(), targetLevel: nextLevel },
              }
            : r
        );
        return changed ? next : prev;
      }
      return [
        ...prev,
        {
          data: { type, level: 0 },
          progress: { startedAt: Date.now(), targetLevel: nextLevel },
          discovered: true,
        },
      ];
    });

    subtractResources(scaledCost);
  };

  const handleCancelResearch = async (type: ResearchType) => {
    const target = researchRef.current.find((r) => r.data.type === type && r.progress);
    if (!target) return;

    const scaledCost = getResearchCost(type, target.progress?.targetLevel ?? 1);
    addResources(scaledCost);

    modifyResearch((prev) => {
      const { next, changed } = mapWithChange(prev, (r) =>
        r.data.type === type ? { ...r, progress: undefined } : r
      );
      return changed ? next : prev;
    });
  };

  const discoverNextResearch = async () => {
    const nextDiscover = getNextDiscoverableResearchType(researchRef.current);
    if (nextDiscover) {
      modifyResearch((prev) => [
        ...prev,
        { data: { type: nextDiscover, level: 0 }, discovered: true },
      ]);

      Alert.alert(
        "Nueva tecnología",
        "El acuerdo te ha proporcionado una nueva fuente de investigación. Visita el laboratorio de tecnologías alienígenas para verla.",
        [{ text: "Aceptar", onPress: () => {} }],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Nueva tecnología",
        "Desgraciadamente ya sabes todo lo que te pueden enseñar. Aun así se quedan con el material por el esfuerzo dedicado.",
        [{ text: "Aceptar", onPress: () => {} }],
        { cancelable: false }
      );
    }
  };

  const stopResearch = async () => {
    modifyResearch((prev) => {
      const { next, changed } = mapWithChange(prev, (r) =>
        r.progress ? { ...r, progress: undefined } : r
      );
      return changed ? next : prev;
    });
  };

  const processResearchTick = async () => {
    const now = Date.now();

    // Para logros:
    const hadCompletedBefore = researchRef.current.some((r) => (r.data.level ?? 0) > 0);
    let completedThisTick = 0;
    let alienAnalyzed = false;
    let miningResearch = false;
    let lastCompleted = false;

    // Hacemos el cambio condicional: si nada cambia, devolvemos prev y NO hay re-render
    modifyResearch((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.progress) {
          const totalTime = getResearchTime(item.data.type, item.progress.targetLevel);
          const elapsed = now - item.progress.startedAt;

          if (elapsed >= totalTime) {
            changed = true;
            completedThisTick += 1;

            if (item.data.type === "MINING") miningResearch = true;

            const config = researchConfig[item.data.type];
            if (config.needsDiscover) alienAnalyzed = true;
            if (item.data.type == "SELENOGRAFIA") lastCompleted = true;

            return {
              data: { type: item.data.type, level: item.progress.targetLevel },
              discovered: true,
            } as Research;
          }
        }
        return item;
      });

      return changed ? next : prev;
    });

    // Si algo terminó, dispara logros/quests
    if (completedThisTick > 0) {
      if (!hadCompletedBefore) onAchievementEvent({ type: "trigger", key: "FIRST_RESEARCH" });

      onAchievementEvent({
        type: "increment",
        key: "RESEARCH_PROJECTS_COMPLETED",
        amount: 1, // mantengo tu lógica original
      });

      if (alienAnalyzed) onAchievementEvent({ type: "trigger", key: "ALIEN_TECH_ANALYZED" });
      if (lastCompleted) onAchievementEvent({ type: "trigger", key: "ALL_RESEARCH_COMPLETE" });
    }

    if (miningResearch) await updateQuest({ type: "RESEARCH_MINING1", completed: true });
  };

  const hasDiscoverableResearch = () => !!getNextDiscoverableResearchType(researchRef.current);

  return {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
    discoverNextResearch,
    stopResearch,
    hasDiscoverableResearch,
  };
};
