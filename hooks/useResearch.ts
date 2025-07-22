import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { researchTechnologies } from "../src/config/researchConfig";
import {
  loadResearch,
  saveResearch,
  saveResources,
} from "../src/services/storage";
import { Research, ResearchType } from "../src/types/researchTypes";
import { StoredResources } from "../src/types/resourceTypes";
import { NotificationManager } from "../utils/notificacionUtils";
import { getResearchCost, getResearchTime } from "../utils/researchUtils";
import {
  applyResourceChange,
  hasEnoughResources,
} from "../utils/resourceUtils";

export const useResearch = (
  resourcesRef: React.RefObject<StoredResources>,
  setResources: React.Dispatch<React.SetStateAction<StoredResources>>
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

    if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
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

    const updatedResources = {
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
  };

  const handleCancelResearch = async (type: ResearchType) => {
    const inProgress = researchRef.current.find(
      (r) => r.progress && r.data.type == type
    );
    if (!inProgress) return;

    const { data, progress } = inProgress;
    const scaledCost = getResearchCost(data.type, progress?.targetLevel ?? 1);

    const refunded = {
      ...resourcesRef.current,
      resources: applyResourceChange(
        resourcesRef.current.resources,
        scaledCost,
        1
      ),
      lastUpdate: Date.now(),
    };

    setResources(refunded);
    resourcesRef.current = refunded;
    await saveResources(refunded);

    if (progress?.notificationId) {
      await NotificationManager.cancelNotification(progress.notificationId);
    }

    const updatedResearch = researchRef.current.map((r) =>
      r.data.type === data.type ? { ...r, progress: undefined } : r
    );

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
