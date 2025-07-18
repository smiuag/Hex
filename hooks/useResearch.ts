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
    await saveResearchs(newResearch);
  };

  const handleResearch = async (type: ResearchType) => {
    const existing = researchRef.current.find((r) => r.type.type === type);

    if (researchRef.current.some((r) => r.progress)) {
      Alert.alert("Ya hay una investigación en curso");
      return;
    }

    const currentLevel = existing?.type.level ?? 0;
    const nextLevel = currentLevel + 1;
    const scaledCost = getResearchCost(type, nextLevel ?? 1);
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

  const cancelResearch = async () => {
    const inProgress = researchRef.current.find((r) => r.progress);
    if (!inProgress) return;

    const { type, progress } = inProgress;
    const scaledCost = getResearchCost(type.type, progress?.targetLevel ?? 1);

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
      r.type.type === type.type ? { ...r, progress: undefined } : r
    );

    await updateResearchState(updatedResearch);
  };

  const processResearchTick = () => {
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
      updateResearchState(updatedResearch);
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
