import { useEffect, useState } from "react";
import { shipConfig } from "../src/config/shipConfig";
import { deleteShip, loadShip, saveShip } from "../src/services/storage";
import { Resources } from "../src/types/resourceTypes";
import { Ship, ShipType } from "../src/types/shipType";
import { getTotalShipCost } from "../utils/shipUtils";

export const useShip = (
  addResources: (modifications: Partial<Resources>) => void,
  subtractResources: (modifications: Partial<Resources>) => void
) => {
  const [shipBuildQueue, setShipBuildQueue] = useState<Ship[]>([]);

  const updateShipQueueState = (updater: Ship[] | ((prev: Ship[]) => Ship[])) => {
    setShipBuildQueue((prev) => {
      const newQueue = typeof updater === "function" ? updater(prev) : updater;
      saveShip(newQueue); // sin await
      return newQueue;
    });
  };

  const resetShip = async () => {
    updateShipQueueState([]);
    await deleteShip();
  };

  const handleBuildShip = async (type: ShipType, amount: number) => {
    const cost = getTotalShipCost(type, amount);
    const now = Date.now();

    updateShipQueueState((prev) => {
      const updated = [...prev];
      const existing = updated.find((r) => r.type === type);

      if (existing) {
        const newRemaining = (existing.progress?.targetAmount ?? 0) + amount;
        return updated.map((r) =>
          r.type === type
            ? {
                ...r,
                progress: {
                  startedAt: r.progress?.startedAt ?? now,
                  targetAmount: newRemaining,
                  notificationId: undefined,
                },
              }
            : r
        );
      } else {
        return [
          ...updated,
          {
            type,
            amount: 0,
            progress: {
              startedAt: now,
              targetAmount: amount,
              notificationId: undefined,
            },
          },
        ];
      }
    });

    subtractResources(cost);
  };

  const handleCancelShip = async (type: ShipType) => {
    updateShipQueueState((prev) => {
      const updated = prev.map((r) => {
        if (r.type !== type || !r.progress) return r;

        const remaining = r.progress.targetAmount - 1;
        if (remaining <= 0) {
          return { ...r, progress: undefined };
        }

        return {
          ...r,
          progress: {
            ...r.progress,
            targetAmount: remaining,
            notificationId: undefined,
          },
        };
      });

      const refundCost = getTotalShipCost(type, 1);
      addResources(refundCost);
      return updated;
    });
  };

  const processShipTick = () => {
    const now = Date.now();

    updateShipQueueState((prev) => {
      let changed = false;

      const updated = prev.map((item) => {
        if (item.progress && item.progress.targetAmount > 0) {
          const timePerUnit = shipConfig[item.type].baseBuildTime;
          const elapsed = now - item.progress.startedAt;

          if (elapsed >= timePerUnit) {
            changed = true;
            const newAmount = item.amount + 1;
            const newTargetAmount = item.progress.targetAmount - 1;
            const newStartedAt = item.progress.startedAt + timePerUnit;

            if (newTargetAmount <= 0) {
              return { type: item.type, amount: newAmount };
            } else {
              return {
                type: item.type,
                amount: newAmount,
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

      return changed ? updated : prev;
    });
  };

  const handleDestroyShip = async (type: ShipType, amount: number) => {
    updateShipQueueState((prev) =>
      prev.map((ship) => (ship.type === type ? { ...ship, amount: ship.amount - amount } : ship))
    );
  };

  const handleCreateShips = async (
    shipsToAdd: { type: ShipType; amount: number }[]
  ): Promise<void> => {
    updateShipQueueState((prev) => {
      const updated = [...prev];

      for (const { type, amount } of shipsToAdd) {
        const existing = updated.find((s) => s.type === type);
        if (existing) {
          existing.amount += amount;
        } else {
          updated.push({ type, amount, progress: undefined });
        }
      }

      return updated;
    });
  };

  const loadData = async () => {
    const saved = await loadShip();
    if (saved) setShipBuildQueue(saved);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    shipBuildQueue,
    handleBuildShip,
    handleCancelShip,
    processShipTick,
    resetShip,
    handleDestroyShip,
    handleCreateShips,
  };
};
