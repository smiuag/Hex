// hooks/useResearch.ts
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { researchTechnologies } from "../src/config/researchConfig";
import {
  loadResearchs,
  saveResearchs,
  saveResources,
} from "../src/services/storage";
import { Research, ResearchType } from "../src/types/researchTypes";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getResearchTime } from "../utils/buildingUtils";
import { NotificationManager } from "../utils/notificacionUtils";
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

  const handleResearch = async (type: ResearchType) => {
    const existing = researchRef.current.find((r) => r.type.type === type);

    if (researchRef.current.find((r) => r.progress)) return;

    const currentLevel = existing?.type.level ?? 0;
    const nextLevel = currentLevel + 1;
    const config = researchTechnologies[type];

    const scaledCost: Partial<Resources> = {};
    for (const key in config.baseCost) {
      const k = key as keyof Resources;
      scaledCost[k] = (config.baseCost[k] ?? 0) * nextLevel;
    }

    if (!hasEnoughResources(resourcesRef.current.resources, scaledCost)) {
      Alert.alert(
        "Recursos insuficientes",
        "No puedes iniciar esta investigación."
      );
      return;
    }

    const durationMs = getResearchTime(type, nextLevel);

    const notificationId = await NotificationManager.scheduleNotification({
      title: "🧪 Investigación terminada",
      body: `Has completado "${type}" nivel ${nextLevel}.`,
      delayMs: durationMs,
    });

    const updatedResearch = [...researchRef.current].map((r) =>
      r.type.type === type
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
        type: { type, level: 0 },
        progress: {
          startedAt: Date.now(),
          targetLevel: nextLevel,
          notificationId: notificationId ?? undefined,
        },
      });
    }

    setResearch(updatedResearch);
    researchRef.current = updatedResearch;
    await saveResearchs(updatedResearch);

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

  const cancelResearch = async () => {
    const inProgress = researchRef.current.find((r) => r.progress);
    if (!inProgress) return;

    const { type, progress } = inProgress;
    const config = researchTechnologies[type.type];
    const baseCost = config.baseCost;

    const scaledCost: Partial<Resources> = {};
    for (const key in baseCost) {
      const k = key as keyof Resources;
      scaledCost[k] = (baseCost[k] ?? 0) * progress!.targetLevel;
    }

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

    if (progress!.notificationId) {
      await NotificationManager.cancelNotification(progress!.notificationId);
    }

    const updatedResearch = researchRef.current.map((r) =>
      r.type.type === type.type ? { ...r, progress: undefined } : r
    );

    setResearch(updatedResearch);
    researchRef.current = updatedResearch;
    await saveResearchs(updatedResearch);
  };

  const processResearchTick = () => {
    console.log("tickResearch");
    const now = Date.now();
    let changed = false;

    const updatedResearch = researchRef.current.map((item) => {
      if (item.progress) {
        const config = researchTechnologies[item.type.type];
        const totalTime = config.baseResearchTime;
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
            type: {
              type: item.type.type,
              level: item.progress.targetLevel,
            },
          };
        }
      }

      return item;
    });

    if (changed) {
      setResearch(updatedResearch);
      researchRef.current = updatedResearch;
      saveResearchs(updatedResearch);
    }
  };

  const loadResearch = async () => {
    const saved = await loadResearchs();
    if (saved) {
      setResearch(saved);
      researchRef.current = saved;
    }
  };

  useEffect(() => {
    loadResearch();
  }, []);

  return {
    research,
    handleResearch,
    cancelResearch,
    processResearchTick,
  };
};
