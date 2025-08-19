import { RETRY_SUCCESS_BONUS, RETRY_SUCCESS_BONUS_CAP } from "@/src/constants/general";
import {
  appendDesignHistory,
  clearActiveDesignAttempt,
  clearDesignHistory,
  loadActiveDesignAttempt,
  loadDesignHistory,
  saveActiveDesignAttempt,
} from "@/src/services/shipSpecsStorage";
import { ConfigEntry, PlayerConfig } from "@/src/types/configTypes";
import { CombinedResources } from "@/src/types/resourceTypes";
import {
  CustomShipSpec,
  CustomShipTypeId,
  defaultCreationStats,
  Draft,
  SHIP_DESIGN_ATTEMPT_DEFAULT,
  SHIP_IMAGES,
  ShipData,
  ShipDesignAttempt,
  ShipId,
  TUNING,
} from "@/src/types/shipType";
import { getCfg } from "@/utils/generalUtils";
import {
  computeAttemptCost,
  computeAttemptTime,
  computeDraftHash,
  extractCreationStatsFromDraft,
  getConsecutiveFailsForHash,
  makeShip,
  mergeMaxCreationStats,
} from "@/utils/shipUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";

// util
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function useShipDesigns(
  playerConfig: PlayerConfig,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  handleUpdateConfig: (config: ConfigEntry) => void,
  handleCreateShips: (shipsToAdd: { type: ShipId; amount: number }[]) => void,
  upsertSpec: (spec: CustomShipSpec) => void
) {
  // Estado visible
  const [active, setActive] = useState<ShipDesignAttempt>(SHIP_DESIGN_ATTEMPT_DEFAULT);
  const [history, setHistory] = useState<ShipDesignAttempt[]>([]);
  const activeRef = useRef<ShipDesignAttempt>(SHIP_DESIGN_ATTEMPT_DEFAULT);
  const historyRef = useRef<ShipDesignAttempt[]>([]);

  const activeSaveChain = useRef(Promise.resolve());
  const historySaveChain = useRef(Promise.resolve());
  const activeHydrated = useRef(false);
  const historyHydrated = useRef(false);

  const replaceActive = (next: ShipDesignAttempt) => {
    activeRef.current = next;
    setActive(next);
  };

  const modifyActive = (modifier: (prev: ShipDesignAttempt) => ShipDesignAttempt) => {
    setActive((prev) => {
      const next = modifier(prev);
      activeRef.current = next;
      return next;
    });
  };

  const replaceHistory = (next: ShipDesignAttempt[]) => {
    historyRef.current = next;
    setHistory(next);
  };

  const appendHistory = (entry: ShipDesignAttempt) => {
    setHistory((prev) => {
      const next = [...prev, entry];
      historyRef.current = next;
      return next;
    });
    // persistencia en serie (append incremental)
    historySaveChain.current = historySaveChain.current
      .then(() => appendDesignHistory(entry))
      .catch((e) => console.error("Error appending design history:", e));
  };

  useEffect(() => {
    if (!activeHydrated.current) {
      activeHydrated.current = true;
      return;
    }
    const snapshot = activeRef.current; // siempre el más reciente
    activeSaveChain.current = activeSaveChain.current
      .then(() => saveActiveDesignAttempt(snapshot))
      .catch((e) => console.error("Error saving active attempt:", e));
  }, [active]);

  /* ───────────────────────── carga inicial ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const [a, h] = await Promise.all([loadActiveDesignAttempt(), loadDesignHistory()]);
        // active
        const nextActive = a ?? SHIP_DESIGN_ATTEMPT_DEFAULT;
        activeRef.current = nextActive;
        setActive(nextActive);
        // history
        const nextHistory = Array.isArray(h) ? h : [];
        historyRef.current = nextHistory;
        setHistory(nextHistory);
      } finally {
        // marca hidratación para que a partir de ahora se persista
        activeHydrated.current = true;
        historyHydrated.current = true;
      }
    })();
  }, []);

  const computeEffectiveChance = useCallback((draft: Draft, baseChance: number) => {
    const streak = getConsecutiveFailsForHash(historyRef.current, computeDraftHash(draft));
    const bonus = Math.min(RETRY_SUCCESS_BONUS_CAP, streak * RETRY_SUCCESS_BONUS);
    return { effective: clamp01(baseChance + bonus), bonus, streak };
  }, []);

  const startAttempt = useCallback(
    async (params: {
      draft: Draft;
      baseSuccessChance: number;
      attemptCost: Partial<CombinedResources>;
      fixedDurationMs?: number;
    }) => {
      const { draft, baseSuccessChance, attemptCost } = params;

      const startedAt = Date.now();
      const { bonus, streak } = computeEffectiveChance(draft, baseSuccessChance);

      const item: ShipDesignAttempt = {
        id: uuid.v4() as string,
        draft,
        draftHash: computeDraftHash(draft),
        startedAt,
        baseSuccessChance,
        bonusSuccess: bonus,
        retryCount: streak,
        attemptCost,
        status: "IN_PROGRESS",
      };

      subtractResources(attemptCost);

      replaceActive(item);
      return { ok: true as const, attempt: item };
    },
    [computeEffectiveChance]
  );

  const resolveAttempt = useCallback(
    async (opts: { success: boolean; specIdIfSuccess?: CustomShipTypeId }) => {
      const curr = activeRef.current;
      if (!curr || curr.status !== "IN_PROGRESS") return;

      const finished: ShipDesignAttempt = {
        ...curr,
        status: opts.success ? "SUCCEEDED" : "FAILED",
        resultSpecId: opts.success ? opts.specIdIfSuccess : undefined,
      };

      if (opts.success) {
        const prevMax = getCfg(playerConfig, "MAX_CREATION_STATS") ?? defaultCreationStats;
        const attempted = extractCreationStatsFromDraft(curr.draft);
        const nextMax = mergeMaxCreationStats(prevMax, attempted);
        await handleUpdateConfig({
          key: "MAX_CREATION_STATS",
          value: nextMax,
        });

        const selectedImg = finished.draft.imageKey
          ? SHIP_IMAGES[finished.draft.imageKey]
          : SHIP_IMAGES["DEFAULT_SHIP_1"];

        const spec: CustomShipSpec = {
          kind: "custom",
          id: opts.specIdIfSuccess!,
          name: finished.draft.name,
          attackTech: finished.draft.attackTech,
          defenseTech: finished.draft.defenseTech,
          attack: finished.draft.attack,
          defense: finished.draft.defense,
          speed: finished.draft.speed,
          hp: finished.draft.hp,
          baseBuildTime: computeAttemptTime({ ...finished.draft }),
          imageBackground: selectedImg,
          baseCost: computeAttemptCost(
            { ...finished.draft },
            { ...TUNING, attemptCostScale: 1 }
          ) as Partial<CombinedResources>,
          productionFacility: "HANGAR",
          createdAt: Date.now(),
        };

        upsertSpec(spec);
        const shipData: ShipData[] = [];
        shipData.push(makeShip(spec.id, 1));
        handleCreateShips(shipData);
      }

      replaceActive(SHIP_DESIGN_ATTEMPT_DEFAULT);

      appendHistory(finished);
    },
    []
  );

  const cancelActiveAttempt = useCallback(async () => {
    const curr = activeRef.current;
    if (!curr || curr.status !== "IN_PROGRESS") return;

    const canceled: ShipDesignAttempt = { ...curr, status: "CANCELED" };

    replaceActive(SHIP_DESIGN_ATTEMPT_DEFAULT);
    appendHistory(canceled);
  }, []);

  const resetShipDesign = useCallback(async () => {
    await Promise.all([clearActiveDesignAttempt(), clearDesignHistory()]);
    replaceActive(SHIP_DESIGN_ATTEMPT_DEFAULT);
    replaceHistory([]);
  }, []);

  return {
    active,
    history,
    resetShipDesign,
    computeEffectiveChance,
    startAttempt,
    resolveAttempt,
    cancelActiveAttempt,
  };
}
