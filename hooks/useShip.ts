import { shipConfig } from "@/src/config/shipConfig";
import { deleteShip, loadShip, saveShip } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { PlayerQuest, UpdateQuestOptions } from "@/src/types/questType";
import { CombinedResources } from "@/src/types/resourceTypes";
import { Ship, ShipType } from "@/src/types/shipType";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { getTotalShipCost } from "../utils/shipUtils";

export const useShip = (
  playerQuests: PlayerQuest[],
  addResources: (modifications: Partial<CombinedResources>) => void,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  enoughResources: (cost: Partial<CombinedResources>) => boolean,
  updateQuest: (options: UpdateQuestOptions) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [shipBuildQueue, setShipBuildQueue] = useState<Ship[]>([]);
  const shipRef = useRef<Ship[]>([]);

  const syncAndSave = (newQueue: Ship[]) => {
    shipRef.current = newQueue;
    setShipBuildQueue(newQueue);
    saveShip(newQueue).catch((e) => console.error("Error saving ships:", e));
  };

  const updateShipQueueState = async (updater: Ship[] | ((prev: Ship[]) => Ship[])) => {
    const updated = typeof updater === "function" ? updater(shipRef.current) : updater;
    syncAndSave(updated);
  };

  const resetShip = async () => {
    await updateShipQueueState([]);
    await deleteShip();
  };

  const handleBuildShip = async (type: ShipType, amount: number) => {
    const cost = getTotalShipCost(type, amount);
    const now = Date.now();

    if (!enoughResources(cost)) {
      Toast.show({
        type: "info",
        text1: "Recursos insuficientes",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    await updateShipQueueState((prev) => {
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
    let didRefund = false;

    await updateShipQueueState((prev) =>
      prev.map((r) => {
        if (r.type !== type || !r.progress) return r;

        const remaining = r.progress.targetAmount - 1;
        if (remaining <= 0) {
          didRefund = true;
          return { ...r, progress: undefined };
        }

        didRefund = true;
        return {
          ...r,
          progress: {
            ...r.progress,
            targetAmount: remaining,
            notificationId: undefined,
          },
        };
      })
    );

    if (didRefund) {
      const refundCost = getTotalShipCost(type, 1);
      addResources(refundCost);
    }
  };

  const processShipTick = async () => {
    const now = Date.now();

    const updatedQueue: Ship[] = [];
    let changed = false;

    for (const item of shipRef.current) {
      if (item.progress && item.progress.targetAmount > 0) {
        const timePerUnit = shipConfig[item.type].baseBuildTime;
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= timePerUnit) {
          changed = true;

          const unitsBuilt = Math.min(
            Math.floor(elapsed / timePerUnit),
            item.progress.targetAmount
          );

          const newAmount = item.amount + unitsBuilt;
          const newTargetAmount = item.progress.targetAmount - unitsBuilt;
          const newStartedAt = item.progress.startedAt + unitsBuilt * timePerUnit;

          if (newTargetAmount <= 0) {
            updatedQueue.push({ type: item.type, amount: newAmount });
          } else {
            updatedQueue.push({
              type: item.type,
              amount: newAmount,
              progress: {
                ...item.progress,
                targetAmount: newTargetAmount,
                startedAt: newStartedAt,
              },
            });
          }
        } else {
          updatedQueue.push(item);
        }
      } else {
        updatedQueue.push(item);
      }
    }

    if (changed) {
      await updateShipQueueState(updatedQueue);
      if (!playerQuests.some((pq) => pq.type == "SHIP_FIRST" && pq.completed))
        await updateQuest({ type: "SHIP_FIRST", completed: true });

      if (updatedQueue.filter((q) => q.amount > 0).length == Object.keys(shipConfig).length)
        onAchievementEvent({ type: "trigger", key: "COLLECT_ALL_SHIPS" });

      onAchievementEvent({ type: "increment", key: "SHIPS_BUILT", amount: 1 });
    }
  };

  const handleDestroyShip = async (type: ShipType, amount: number) => {
    await updateShipQueueState((prev) =>
      prev.map((ship) => (ship.type === type ? { ...ship, amount: ship.amount - amount } : ship))
    );
  };

  const handleCreateShips = async (shipsToAdd: { type: ShipType; amount: number }[]) => {
    await updateShipQueueState((prev) => {
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
    if (saved) syncAndSave(saved);
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
