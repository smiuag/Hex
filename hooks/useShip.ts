import { shipConfig } from "@/src/config/shipConfig";
import { GENERAL_FACTOR } from "@/src/constants/general";
import { deleteShip, loadShip, saveShip } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { PlayerQuest, UpdateQuestOptions } from "@/src/types/questType";
import { CombinedResources } from "@/src/types/resourceTypes";
import { Ship, ShipId, ShipSpecsCtx } from "@/src/types/shipType";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { getSpecByType, getTotalShipCost, makeShip } from "../utils/shipUtils";

export const useShip = (
  playerQuests: PlayerQuest[],
  specs: ShipSpecsCtx,
  addResources: (modifications: Partial<CombinedResources>) => void,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  enoughResources: (cost: Partial<CombinedResources>) => boolean,
  updateQuest: (options: UpdateQuestOptions) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [shipBuildQueue, setShipBuildQueue] = useState<Ship[]>([]);
  const shipRef = useRef<Ship[]>([]);

  // Persistencia serializada
  const saveChain = useRef(Promise.resolve());
  const readyToPersist = useRef(false);

  // Persistir cada cambio real
  useEffect(() => {
    if (!readyToPersist.current) return;
    const snapshot = shipRef.current;
    saveChain.current = saveChain.current
      .then(() => saveShip(snapshot))
      .catch((e) => console.error("Error saving ships:", e));
  }, [shipBuildQueue]);

  // Helpers
  const mapWithChange = <T>(
    arr: T[],
    fn: (x: T, i: number) => T
  ): { next: T[]; changed: boolean } => {
    let changed = false;
    const next = arr.map((x, i) => {
      const y = fn(x, i);
      if (y !== x) changed = true;
      return y;
    });
    return { next, changed };
  };

  const modifyQueue = (modifier: (prev: Ship[]) => Ship[]) => {
    setShipBuildQueue((prev) => {
      const next = modifier(prev);
      if (next === prev) return prev; // short-circuit: no cambios → no re-render
      shipRef.current = next;
      return next;
    });
  };

  const syncAndSet = (newQueue: Ship[]) => {
    shipRef.current = newQueue;
    setShipBuildQueue(newQueue);
  };

  const resetShip = async () => {
    syncAndSet([]);
    await deleteShip();
  };

  const handleBuildShip = async (type: ShipId, amount: number) => {
    const cost = getTotalShipCost(type, specs, amount);
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

    modifyQueue((prev) => {
      const existing = prev.some((r) => r.type === type);
      if (existing) {
        const { next, changed } = mapWithChange(prev, (r) =>
          r.type === type
            ? {
                ...r,
                progress: {
                  startedAt: r.progress?.startedAt ?? now,
                  targetAmount: (r.progress?.targetAmount ?? 0) + amount,
                  ...(r.progress?.notificationId
                    ? { notificationId: r.progress.notificationId }
                    : {}),
                },
              }
            : r
        );
        return changed ? next : prev;
      }
      const base = makeShip(type, 0);
      return [
        ...prev,
        {
          ...base,
          progress: { startedAt: now, targetAmount: amount },
        },
      ];
    });

    subtractResources(cost);
  };

  const handleCancelShip = async (type: ShipId) => {
    let didRefund = false;

    modifyQueue((prev) => {
      let localRefund = false;
      const { next, changed } = mapWithChange(prev, (r) => {
        if (r.type !== type || !r.progress) return r;
        const remaining = r.progress.targetAmount - 1;
        localRefund = true;
        if (remaining <= 0) {
          return { ...r, progress: undefined };
        }
        return {
          ...r,
          progress: { ...r.progress, targetAmount: remaining, notificationId: undefined },
        };
      });
      didRefund = changed && localRefund;
      return changed ? next : prev;
    });

    if (didRefund) {
      const refundCost = getTotalShipCost(type, specs, 1);
      addResources(refundCost);
    }
  };

  const processShipTick = async () => {
    const now = Date.now();
    let changed = false;

    modifyQueue((prev) => {
      const updated: Ship[] = [];
      for (const item of prev) {
        const inQueue = !!item.progress && item.progress.targetAmount > 0;

        if (!inQueue) {
          // Sin cola → conservar tal cual
          updated.push(item);
          continue;
        }

        const spec = getSpecByType(item.type, specs);
        const timePerUnit = spec.baseBuildTime / GENERAL_FACTOR;

        const elapsed = now - item.progress!.startedAt;

        if (elapsed < timePerUnit) {
          // Aún no toca construir → conservar tal cual
          updated.push(item);
          continue;
        }

        // Construcción lista para avanzar
        changed = true;

        const unitsBuilt = Math.min(Math.floor(elapsed / timePerUnit), item.progress!.targetAmount);

        const newAmount = item.amount + unitsBuilt;
        const newTargetAmount = item.progress!.targetAmount - unitsBuilt;
        const newStartedAt = item.progress!.startedAt + unitsBuilt * timePerUnit;

        if (newTargetAmount <= 0) {
          // Cola terminada → deja ship “limpio”
          updated.push(makeShip(item.type, newAmount));
        } else {
          // Sigue en cola
          updated.push({
            ...item,
            amount: newAmount,
            progress: {
              ...item.progress!,
              targetAmount: newTargetAmount,
              startedAt: newStartedAt,
            },
          });
        }
      }

      return changed ? updated : prev;
    });

    if (changed) {
      if (!playerQuests.some((pq) => pq.type === "SHIP_FIRST" && pq.completed)) {
        await updateQuest({ type: "SHIP_FIRST", completed: true });
      }

      if (
        shipRef.current.filter((q) => q.amount > 0 && !q.custom).length >=
        Object.keys(shipConfig).length
      ) {
        onAchievementEvent({ type: "trigger", key: "COLLECT_ALL_SHIPS" });
      }

      onAchievementEvent({ type: "increment", key: "SHIPS_BUILT", amount: 1 });
    }
  };

  const handleDestroyShip = async (type: ShipId, amount: number) => {
    modifyQueue((prev) => {
      let any = false;
      const { next, changed } = mapWithChange(prev, (ship) => {
        if (ship.type !== type) return ship;
        const newAmount = ship.amount - amount;
        if (newAmount === ship.amount) return ship;
        any = true;
        return { ...ship, amount: newAmount };
      });
      return changed && any ? next : prev;
    });
  };

  const handleCreateShips = async (shipsToAdd: { type: ShipId; amount: number }[]) => {
    modifyQueue((prev) => {
      if (shipsToAdd.length === 0) return prev;
      const next = [...prev];
      let changed = false;

      for (const { type, amount } of shipsToAdd) {
        if (amount === 0) continue;
        const idx = next.findIndex((s) => s.type === type);
        if (idx >= 0) {
          const cur = next[idx];
          const newAmount = cur.amount + amount;
          if (newAmount !== cur.amount) {
            next[idx] = { ...cur, amount: newAmount };
            changed = true;
          }
        } else {
          next.push(makeShip(type, amount));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const loadData = async () => {
    const saved = await loadShip();
    if (saved) {
      syncAndSet(saved);
    } else {
      syncAndSet([]);
    }
    readyToPersist.current = true; // activamos guardado tras hidratar
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
