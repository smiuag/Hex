import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { researchConfig } from "../src/config/researchConfig";
import { loadResearch, saveResearch } from "../src/services/storage";
import { Research, ResearchType } from "../src/types/researchTypes";
import { Resources } from "../src/types/resourceTypes";
import { NotificationManager } from "../utils/notificacionUtils";
import { getResearchCost, getResearchTime } from "../utils/researchUtils";

export const useResearch = (
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  enoughResources: (cost: Partial<Resources>) => boolean
) => {
  const [research, setResearch] = useState<Research[]>([]);

  const updateResearchState = (updater: Research[] | ((prev: Research[]) => Research[])) => {
    setResearch((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      saveResearch(updated).catch((e) => console.error("Error saving research:", e));
      return updated;
    });
  };

  const resetResearch = async () => {
    setResearch([]);
    await saveResearch([]);
  };

  const handleResearch = async (type: ResearchType) => {
    const currentLevel = research.find((r) => r.data.type === type)?.data.level ?? 0;
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

    updateResearchState((prev) => {
      const existing = prev.find((r) => r.data.type === type);
      const updated = [...prev];

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
    const target = research.find((r) => r.data.type === type && r.progress);
    if (!target) return;

    const scaledCost = getResearchCost(target.data.type, target.progress?.targetLevel ?? 1);

    addResources(scaledCost);

    if (target.progress?.notificationId) {
      await NotificationManager.cancelNotification(target.progress.notificationId);
    }

    updateResearchState((prev) =>
      prev.map((r) => (r.data.type === type ? { ...r, progress: undefined } : r))
    );
  };

  const processResearchTick = async (tResearch: (key: string) => string) => {
    const now = Date.now();

    let changed = false;

    const updated = research.map((item) => {
      if (item.progress) {
        const config = researchConfig[item.data.type];
        const totalTime = getResearchTime(item.data.type, item.progress.targetLevel);
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= totalTime) {
          changed = true;

          Notifications.scheduleNotificationAsync({
            content: {
              title: "🧠 Investigación completada",
              body: `Has finalizado la investigación "${tResearch(
                `researchName.${item.data.type}`
              )}".`,
              sound: true,
            },
            trigger: null,
          });

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

    if (changed) {
      updateResearchState(updated);
    }
  };

  const loadData = async () => {
    const saved = await loadResearch();
    if (saved) {
      setResearch(saved);
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
