import { useEffect, useRef, useState } from "react";
import { fleetConfig } from "../src/config/fleetConfig";
import { loadFleet, saveFleet } from "../src/services/storage";
import { Fleet, FleetType } from "../src/types/fleetType";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getTotalFleetCost } from "../utils/fleetUtils";
import { NotificationManager } from "../utils/notificacionUtils";

export const useFleet = (
  resources: StoredResources,
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void
) => {
  const [fleetBuildQueue, setFleetBuildQueue] = useState<Fleet[]>([]);
  const fleetBuildQueueRef = useRef<Fleet[]>([]);

  const updateFleetQueueState = async (newFleetQueue: Fleet[]) => {
    setFleetBuildQueue(newFleetQueue);
    fleetBuildQueueRef.current = newFleetQueue;
    await saveFleet(newFleetQueue);
  };

  const resetFleet = async () => {
    setFleetBuildQueue([]);
    fleetBuildQueueRef.current = [];
    await saveFleet([]);
  };

  const handleBuildFleet = async (type: FleetType, amount: number) => {
    const existing = fleetBuildQueueRef.current.find(
      (r) => r.data.type === type
    );
    const config = fleetConfig[type];

    const cost = getTotalFleetCost(type, amount);

    // const durationMs = config.baseBuildTime * amount;
    // const notificationId = await NotificationManager.scheduleNotification({
    //   title: "🧪 Investigación terminada",
    //   body: `Has completado "${type}" nivel ${nextLevel}.`,
    //   delayMs: durationMs,
    // });

    const updatedFleetQueue = [...fleetBuildQueueRef.current].map((r) =>
      r.data.type === type
        ? {
            ...r,
            progress: {
              startedAt: Date.now(),
              targetAmount: amount,
              notificationId: undefined,
            },
          }
        : r
    );

    if (!existing) {
      updatedFleetQueue.push({
        data: { type, amount: amount },
        progress: {
          startedAt: Date.now(),
          targetAmount: amount,
          notificationId: undefined,
        },
      });
    }

    await updateFleetQueueState(updatedFleetQueue);

    subtractResources(cost);
  };

  const handleCancelFleet = async (type: FleetType) => {
    const inProgress = fleetBuildQueueRef.current.find(
      (r) => r.progress && r.data.type == type
    );
    if (!inProgress) return;

    const { data, progress } = inProgress;
    const totalCost = getTotalFleetCost(data.type, progress?.targetAmount!);

    addResources(totalCost);

    if (progress?.notificationId) {
      await NotificationManager.cancelNotification(progress.notificationId);
    }

    const updatedResearch = fleetBuildQueueRef.current.map((r) =>
      r.data.type === data.type ? { ...r, progress: undefined } : r
    );

    await updateFleetQueueState(updatedResearch);
  };

  const processFleetTick = async () => {
    const now = Date.now();
    let changed = false;

    const updatedFleetQueue = fleetBuildQueueRef.current.map((item) => {
      if (item.progress) {
        const config = fleetConfig[item.data.type];
        const totalTime = config.baseBuildTime * item.progress.targetAmount;
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= totalTime) {
          changed = true;

          //   Notifications.scheduleNotificationAsync({
          //     content: {
          //       title: "🧠 Investigación completada",
          //       body: `Has finalizado la investigación "${config.name}".`,
          //       sound: true,
          //     },
          //     trigger: null,
          //   });

          return {
            data: {
              type: item.data.type,
              amount: item.progress.targetAmount,
            },
          };
        }
      }

      return item;
    });

    if (changed) {
      await updateFleetQueueState(updatedFleetQueue);
    }
  };

  const loadData = async () => {
    const saved = await loadFleet();
    if (saved) {
      setFleetBuildQueue(saved);
      fleetBuildQueueRef.current = saved;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    fleetBuildQueue,
    handleBuildFleet,
    handleCancelFleet,
    processFleetTick,
    resetFleet,
  };
};
