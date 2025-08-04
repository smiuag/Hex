import { loadResearch, saveResearch } from "@/src/services/storage";
import { UpdateQuestOptions } from "@/src/types/questType";
import { Research, ResearchType } from "@/src/types/researchTypes";
import { Resources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { NotificationManager } from "../utils/notificacionUtils";
import { getResearchCost, getResearchTime } from "../utils/researchUtils";

export const useResearch = (
  addResources: (mod: Partial<Resources>) => void,
  subtractResources: (mod: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean,
  updateQuest: (options: UpdateQuestOptions) => void
) => {
  const [research, setResearch] = useState<Research[]>([]);
  const researchRef = useRef<Research[]>([]);

  const syncAndSave = (newState: Research[]) => {
    researchRef.current = newState;
    setResearch(newState);
    saveResearch(newState).catch((e) => console.error("Error saving research:", e));
  };

  const updateResearchState = async (updater: Research[] | ((prev: Research[]) => Research[])) => {
    const updated = typeof updater === "function" ? updater(researchRef.current) : updater;
    syncAndSave(updated);
  };

  const resetResearch = async () => {
    syncAndSave([]);
  };

  const handleResearch = async (type: ResearchType) => {
    const currentLevel = researchRef.current.find((r) => r.data.type === type)?.data.level ?? 0;
    const nextLevel = currentLevel + 1;
    const scaledCost = getResearchCost(type, nextLevel);
    const durationMs = getResearchTime(type, nextLevel);

    if (!enoughResources(scaledCost)) {
      Toast.show({
        type: "info",
        text1: "Recursos insuficientes",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    const notificationId = await NotificationManager.scheduleNotification({
      title: "🧪 Investigación terminada",
      body: `Has completado "${type}" nivel ${nextLevel}.`,
      delayMs: durationMs,
    });

    await updateResearchState((prev) => {
      const updated = [...prev];
      const existing = updated.find((r) => r.data.type === type);

      if (existing) {
        return updated.map((r) =>
          r.data.type === type
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
      }

      updated.push({
        data: { type, level: 0 },
        progress: {
          startedAt: Date.now(),
          targetLevel: nextLevel,
          notificationId: notificationId ?? undefined,
        },
      });

      return updated;
    });

    subtractResources(scaledCost);
  };

  const handleCancelResearch = async (type: ResearchType) => {
    const target = researchRef.current.find((r) => r.data.type === type && r.progress);
    if (!target) return;

    const scaledCost = getResearchCost(type, target.progress?.targetLevel ?? 1);
    addResources(scaledCost);

    if (target.progress?.notificationId) {
      await NotificationManager.cancelNotification(target.progress.notificationId);
    }

    await updateResearchState((prev) =>
      prev.map((r) => (r.data.type === type ? { ...r, progress: undefined } : r))
    );
  };

  const processResearchTick = async (tResearch: (key: string) => string) => {
    const now = Date.now();
    let changed = false;
    let miningResearch = false;

    const updated = researchRef.current.map((item) => {
      if (item.progress) {
        const totalTime = getResearchTime(item.data.type, item.progress.targetLevel);
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= totalTime) {
          changed = true;

          // Notifications.scheduleNotificationAsync({
          //   content: {
          //     title: "🧠 Investigación completada",
          //     body: `Has finalizado la investigación "${tResearch(
          //       `researchName.${item.data.type}`
          //     )}".`,
          //     sound: true,
          //   },
          //   trigger: null,
          // });

          if (item.data.type == "MINING") miningResearch = true;

          return {
            data: {
              type: item.data.type,
              level: item.progress.targetLevel,
            },
          };
        }
      }

      return item;
    });

    if (changed) await updateResearchState(updated);

    if (miningResearch) await updateQuest({ type: "RESEARCH_MINING1", completed: true });
  };

  const loadData = async () => {
    const saved = await loadResearch();
    if (saved) {
      syncAndSave(saved);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    research,
    handleResearch,
    handleCancelResearch,
    processResearchTick,
    resetResearch,
  };
};
