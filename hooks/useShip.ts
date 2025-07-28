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

  const updateShipQueueState = async (newShipQueue: Ship[]) => {
    setShipBuildQueue(newShipQueue);
    await saveShip(newShipQueue);
  };

  const resetShip = async () => {
    setShipBuildQueue([]);
    await deleteShip();
  };

  const handleBuildShip = async (type: ShipType, amount: number) => {
    const existing = shipBuildQueue.find((r) => r.type === type);

    const cost = getTotalShipCost(type, amount);

    let updatedShipQueue: Ship[] = [];
    const now = Date.now();

    if (existing) {
      updatedShipQueue = shipBuildQueue.map((r) => {
        if (r.type === type) {
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
      updatedShipQueue = [
        ...shipBuildQueue,
        {
          type: type,
          amount: 0,
          progress: {
            startedAt: now,
            targetAmount: amount,
            notificationId: undefined,
          },
        },
      ];
    }

    await updateShipQueueState(updatedShipQueue);
    subtractResources(cost);
  };

  const handleCancelShip = async (type: ShipType) => {
    const inProgress = shipBuildQueue.find((r) => r.progress && r.type === type);
    if (!inProgress || !inProgress.progress) return;

    const { progress } = inProgress;

    const refundCost = getTotalShipCost(type, 1);
    addResources(refundCost);

    const updatedShipQueue = shipBuildQueue.map((r) => {
      if (r.type !== type) return r;

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

    await updateShipQueueState(updatedShipQueue);
  };

  const processShipTick = async () => {
    const now = Date.now();
    let changed = false;
    const updatedShipQueue = shipBuildQueue.map((item) => {
      if (item.progress && item.progress.targetAmount > 0) {
        const config = shipConfig[item.type];
        const timePerUnit = config.baseBuildTime;
        const elapsed = now - item.progress.startedAt;

        if (elapsed >= timePerUnit) {
          changed = true;

          const newAmount = item.amount + 1;
          const newTargetAmount = item.progress.targetAmount - 1;
          const newStartedAt = item.progress.startedAt + timePerUnit;

          if (newTargetAmount <= 0) {
            return {
              type: item.type,
              amount: newAmount,
            };
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

    if (changed) {
      await updateShipQueueState(updatedShipQueue);
    }
  };

  const handleDestroyShip = async (type: ShipType, amount: number) => {
    const updatedShips = shipBuildQueue.map((ship) => {
      if (ship.type !== type) return ship;
      return { ...ship, data: { amount: ship.amount - amount } };
    });

    await updateShipQueueState(updatedShips);
  };

  const handleCreateShips = async (
    shipsToAdd: { type: ShipType; amount: number }[]
  ): Promise<void> => {
    shipsToAdd.forEach(({ type, amount }) => {
      for (let i = 0; i < shipBuildQueue.length; i++) {
        if (shipBuildQueue[i].type === type) {
          shipBuildQueue[i] = { ...shipBuildQueue[i], amount: shipBuildQueue[i].amount + amount };
          return;
        }
      }

      shipBuildQueue.push({
        type,
        amount,
        progress: undefined,
      });
    });

    await updateShipQueueState(shipBuildQueue);
  };

  const loadData = async () => {
    const saved = await loadShip();
    if (saved) {
      setShipBuildQueue(saved);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    handleDestroyShip,
    handleCreateShips,
    shipBuildQueue,
    handleBuildShip,
    handleCancelShip,
    processShipTick,
    resetShip,
  };
};
