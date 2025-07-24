import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { researchTechnologies } from "../src/config/researchConfig";
import { loadResearch, saveResearch } from "../src/services/storage";
import { Research, ResearchType } from "../src/types/researchTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { NotificationManager } from "../utils/notificacionUtils";
import { getResearchCost, getResearchTime } from "../utils/researchUtils";
import { hasEnoughResources } from "../utils/resourceUtils";

export const useResearch = (
  resources: StoredResources,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void
) => {
  const [research, setResearch] = useState<Research[]>([]);
  const researchRef = useRef<Research[]>([]);

  const updateResearchState = async (newResearch: Research[]) => {
    setResearch(newResearch);
    researchRef.current = newResearch;
    await saveResearch(newResearch);
  };

  const resetResearch = async () => {
    setResearch([]);
    researchRef.current = [];
    await saveResearch([]);
  };

  const handleResearch = async (type: ResearchType) => {
    const existing = researchRef.current.find((r) => r.data.type === type);

    const currentLevel = existing?.data.level ?? 0;
    const nextLevel = currentLevel + 1;
    const scaledCost = getResearchCost(type, nextLevel);
    const durationMs = getResearchTime(type, nextLevel);

    if (!hasEnoughResources(resources, scaledCost)) {
      Alert.alert(
        "Recursos insuficientes",
        "No puedes iniciar esta investigación."
      );
      return;
    }

    const notificationId = await NotificationManager.scheduleNotification({
      title: "🧪 Investigación terminada",
      body: `Has completado "${type}" nivel ${nextLevel}.`,
      delayMs: durationMs,
    });

    const updatedResearch = [...researchRef.current].map((r) =>
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

    if (!existing) {
      updatedResearch.push({
        data: { type, level: 0 },
        progress: {
          startedAt: Date.now(),
          targetLevel: nextLevel,
          notificationId: notificationId ?? undefined,
        },
      });
    }

    await updateResearchState(updatedResearch);

    subtractResources(scaledCost);
  };

  const handleCancelResearch = async (type: ResearchType) => {
    const inProgress = researchRef.current.find(
      (r) => r.progress && r.data.type == type
    );
    if (!inProgress) return;

    const { data, progress } = inProgress;
    const scaledCost = getResearchCost(data.type, progress?.targetLevel ?? 1);

    addResources(scaledCost);

    if (progress?.notificationId) {
      await NotificationManager.cancelNotification(progress.notificationId);
    }

    const updatedResearch = researchRef.current.map((r) =>
      r.data.type === data.type ? { ...r, progress: undefined } : r
    );

    setResearch(updatedResearch);
    await updateResearchState(updatedResearch);
  };

  const processResearchTick = async () => {
    const now = Date.now();
    let changed = false;

    const updatedResearch = researchRef.current.map((item) => {
      if (item.progress) {
        const config = researchTechnologies[item.data.type];
        const totalTime = getResearchTime(
          item.data.type,
          item.progress.targetLevel
        );
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= totalTime) {
          changed = true;

          Notifications.scheduleNotificationAsync({
            content: {
              title: "🧠 Investigación completada",
              body: `Has finalizado la investigación "${config.name}".`,
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
      await updateResearchState(updatedResearch);
    }
  };

  const loadData = async () => {
    const saved = await loadResearch();
    if (saved) {
      setResearch(saved);
      researchRef.current = saved;
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
