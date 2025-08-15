// src/hooks/useAchievements.ts
import { achievementConfig, defaultProg } from "@/src/config/achievementConfig";
import { loadAchievements, saveAchievements } from "@/src/services/storage";
import {
  AchievementConfig,
  AchievementEvent,
  AchievementType,
  PlayerAchievement,
  ToastPayload,
  UseAchievementsOpts,
} from "@/src/types/achievementTypes";
import { defaultProgress } from "@/utils/achievementsUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
export function useAchievements(opts?: UseAchievementsOpts) {
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([]);
  const ref = useRef<PlayerAchievement[]>([]);

  const cfgById = useMemo(
    () => new Map<AchievementType, AchievementConfig>(achievementConfig.map((c) => [c.id, c])),
    []
  );

  const syncSave = useCallback((next: PlayerAchievement[], save = true) => {
    ref.current = next;
    setPlayerAchievements(next);
    if (save) saveAchievements(next);
  }, []);

  // Migra/normaliza contra el config
  const migrate = useCallback(
    (saved: PlayerAchievement[] | null): PlayerAchievement[] => {
      const byId = new Map<AchievementType, PlayerAchievement>();
      // inicializa vacíos
      for (const c of achievementConfig) {
        byId.set(c.id, {
          id: c.id,
          progress: 0,
          unlockedTier: 0,
          claimedTier: 0,
          setItems: c.metric.kind === "set" ? [] : undefined,
        });
      }
      // mezcla con guardado
      for (const s of saved || []) {
        if (!cfgById.has(s.id)) continue; // desconocido -> ignora
        const base = byId.get(s.id)!;
        byId.set(s.id, {
          ...base,
          progress: typeof s.progress === "number" ? s.progress : base.progress,
          unlockedTier: Math.max(0, s.unlockedTier ?? 0),
          claimedTier: Math.max(0, s.claimedTier ?? 0),
          setItems:
            base.setItems !== undefined
              ? Array.from(new Set([...(base.setItems || []), ...(s.setItems || [])]))
              : undefined,
          firstUnlockAt: s.firstUnlockAt,
          lastProgressAt: s.lastProgressAt,
        });
      }
      return Array.from(byId.values());
    },
    [cfgById]
  );

  // Carga inicial
  useEffect(() => {
    (async () => {
      const saved = await loadAchievements();
      const initial = migrate(saved);
      syncSave(initial, false);
    })();
  }, [migrate, syncSave]);

  // Helpers
  const findPlayer = (id: AchievementType) => ref.current.find((a) => a.id === id)!;
  const now = () => Date.now();

  const evaluateUnlocks = useCallback(
    (id: AchievementType, acc: PlayerAchievement): ToastPayload[] => {
      const cfg = cfgById.get(id)!;
      let newUnlocked = acc.unlockedTier;
      for (const t of cfg.tiers) {
        if (acc.progress >= t.threshold) newUnlocked = Math.max(newUnlocked, t.tier);
      }
      const toasts: ToastPayload[] = [];
      if (newUnlocked > acc.unlockedTier) {
        const unlockedNow = cfg.tiers
          .filter((t) => t.tier > acc.unlockedTier && t.tier <= newUnlocked)
          .sort((a, b) => a.tier - b.tier);
        // preparar toasts y recompensas
        for (const tier of unlockedNow) {
          toasts.push({
            id,
            tier: tier.tier,
            titleKey: tier.titleKey,
            descKey: tier.descKey,
            icon: tier.icon,
          });
        }
        acc.unlockedTier = newUnlocked;
        if (!acc.firstUnlockAt) acc.firstUnlockAt = now();
      }
      return toasts;
    },
    [cfgById]
  );

  // API pública: onEvent
  const onAchievementEvent = useCallback(
    (ev: AchievementEvent) => {
      const next = ref.current.map((a) => ({ ...a })); // copia superficial
      const toasts: ToastPayload[] = [];

      for (const a of next) {
        const cfg = cfgById.get(a.id)!;
        const m = cfg.metric;

        switch (m.kind) {
          case "counter": {
            if (ev.type === "increment" && ev.key === m.key && ev.amount > 0) {
              a.progress += ev.amount;
              a.lastProgressAt = now();
              toasts.push(...evaluateUnlocks(a.id, a));
            }
            break;
          }
          case "set": {
            if (ev.type === "addToSet" && ev.key === m.key) {
              a.setItems = a.setItems || [];
              if (!a.setItems.includes(ev.itemId)) {
                a.setItems.push(ev.itemId);
                a.progress = a.setItems.length;
                a.lastProgressAt = now();
                toasts.push(...evaluateUnlocks(a.id, a));
              }
            }
            break;
          }
          case "boolean": {
            // puedes dispararlo por id concreto o por key genérica si lo prefieres
            if (
              (ev.type === "increment" && ev.key === a.id && ev.amount > 0) ||
              (ev.type === "trigger" && ev.key === a.id)
            ) {
              if (a.progress < 1) {
                a.progress = 1;
                a.lastProgressAt = now();
                toasts.push(...evaluateUnlocks(a.id, a));
              }
            }
            break;
          }
        }
      }

      if (toasts.length > 0) {
        syncSave(next);
        // dispara toasts (uno por tier desbloqueado)
        toasts.forEach((t) => opts?.toast?.(t));
      } else {
        // guarda sin toast si solo hubo progreso sin desbloqueo
        syncSave(next);
      }
    },
    [cfgById, evaluateUnlocks, syncSave]
  );

  // // Reclamar recompensa de un tier específico o del más alto desbloqueado no reclamado
  // const claimTier = useCallback(
  //   (id: AchievementId, tier?: number) => {
  //     const next = ref.current.map((a) => ({ ...a }));
  //     const me = next.find((a) => a.id === id)!;

  //     const targetTier = tier ?? me.unlockedTier;
  //     if (targetTier <= me.claimedTier || targetTier > me.unlockedTier) return false;

  //     me.claimedTier = targetTier;
  //     syncSave(next);
  //     return true;
  //   },
  //   [cfgById, findPlayer, opts, syncSave]
  // );

  // Info de progreso para UI
  const getProgress = (id: string) => {
    try {
      const p = playerAchievements.find((a) => a.id === id);
      const unlockedTier = p?.unlockedTier ?? 0;
      const claimedTier = p?.claimedTier ?? 0;
      // ... calcula progress/nextThreshold/ratio según tu métrica
      return {
        ...defaultProgress,
        unlockedTier,
        claimedTier /*, progress, nextThreshold, ratio */,
      };
    } catch {
      return defaultProg;
    }
  };

  const resetAchievements = useCallback(async () => {
    const fresh = migrate(null);
    syncSave(fresh);
  }, [migrate, syncSave]);

  return {
    playerAchievements,
    onAchievementEvent,
    // claimTier,
    getProgress,
    resetAchievements,
  };
}
