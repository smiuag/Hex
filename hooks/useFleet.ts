import { useEffect, useRef, useState } from "react";
import { fleetConfig } from "../src/config/fleetConfig";
import { deleteFleet, loadFleet, saveFleet } from "../src/services/storage";
import { Fleet, FleetType } from "../src/types/fleetType";
import { Resources } from "../src/types/resourceTypes";
import { getTotalFleetCost } from "../utils/fleetUtils";

export const useFleet = (
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
    await deleteFleet();
  };
  const handleBuildFleet = async (type: FleetType, amount: number) => {
    const existing = fleetBuildQueueRef.current.find(
      (r) => r.data.type === type
    );

    const cost = getTotalFleetCost(type, amount);

    let updatedFleetQueue: Fleet[] = [];
    const now = Date.now();

    if (existing) {
      updatedFleetQueue = fleetBuildQueueRef.current.map((r) => {
        if (r.data.type === type) {
          const newRemaining = (r.progress?.targetAmount ?? 0) + amount;
          return {
            ...r,
            progress: {
              startedAt: r.progress?.startedAt ?? now,
              targetAmount: newRemaining,
              notificationId: undefined,
            },
          };
        }
        return r;
      });
    } else {
      updatedFleetQueue = [
        ...fleetBuildQueueRef.current,
        {
          data: { type, amount: 0 }, // amount se actualiza al finalizar cada unidad
          progress: {
            startedAt: now,
            targetAmount: amount,
            notificationId: undefined,
          },
        },
      ];
    }

    await updateFleetQueueState(updatedFleetQueue);
    subtractResources(cost);
  };

  const handleCancelFleet = async (type: FleetType) => {
    const inProgress = fleetBuildQueueRef.current.find(
      (r) => r.progress && r.data.type === type
    );
    if (!inProgress || !inProgress.progress) return;

    const { progress } = inProgress;

    const refundCost = getTotalFleetCost(type, 1);
    addResources(refundCost);

    const updatedFleetQueue = fleetBuildQueueRef.current.map((r) => {
      if (r.data.type !== type) return r;

      const remaining = progress.targetAmount - 1;

      if (remaining <= 0) {
        return {
          ...r,
          progress: undefined,
        };
      }

      return {
        ...r,
        progress: {
          ...progress,
          targetAmount: remaining,
          startedAt: progress.startedAt, // mantener tiempo original
          notificationId: undefined, // opcional: cancelar notif
        },
      };
    });

    await updateFleetQueueState(updatedFleetQueue);
  };

  const processFleetTick = async () => {
    const now = Date.now();
    let changed = false;
    const updatedFleetQueue = fleetBuildQueueRef.current.map((item) => {
      if (item.progress && item.progress.targetAmount > 0) {
        const config = fleetConfig[item.data.type];
        const timePerUnit = config.baseBuildTime;
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= timePerUnit) {
          changed = true;

          const newAmount = item.data.amount + 1;
          const newTargetAmount = item.progress.targetAmount - 1;
          const newStartedAt = item.progress.startedAt + timePerUnit;

          if (newTargetAmount <= 0) {
            return {
              data: {
                ...item.data,
                amount: newAmount,
              },
            };
          } else {
            return {
              ...item,
              data: {
                ...item.data,
                amount: newAmount,
              },
              progress: {
                ...item.progress,
                targetAmount: newTargetAmount,
                startedAt: newStartedAt,
              },
            };
          }
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
