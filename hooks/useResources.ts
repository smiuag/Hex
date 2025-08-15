import { loadResources, saveResources } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { CombinedResources, StoredResources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import { getInitialResources } from "../utils/hexUtils";
import { getAccumulatedResources, hasEnoughResources } from "../utils/resourceUtils";

export function useResources(onAchievementEvent: (ev: AchievementEvent) => void) {
  const [resources, setResources] = useState<StoredResources>(getInitialResources());
  const reservedRef = useRef<Partial<CombinedResources>>({});

  useEffect(() => {
    const load = async () => {
      const saved = await loadResources();
      setResources(saved);
    };
    load();
  }, []);

  const resetResources = async () => {
    const initial = getInitialResources();
    reservedRef.current = {};
    setResources(initial);
    await saveResources(initial);
  };

  const releaseResources = (cost: Partial<CombinedResources>) => {
    for (const key in cost) {
      const typedKey = key as keyof CombinedResources;
      reservedRef.current[typedKey] = Math.max(
        0,
        (reservedRef.current[typedKey] || 0) - (cost[typedKey] || 0)
      );
    }
  };

  const subtractResources = async (modifications: Partial<CombinedResources>) => {
    releaseResources(modifications);

    const now = Date.now();
    const prev = resources;
    const { resources: updated, delta } = getAccumulatedResources(resources);

    for (const key in modifications) {
      const typedKey = key as keyof CombinedResources;
      updated[typedKey] = (updated[typedKey] || 0) - (modifications[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      resources: updated as CombinedResources,
      lastUpdate: now,
      production: prev.production,
    };

    setResources(updatedState);

    const minerales = Math.max(0, delta.STONE ?? 0);
    if (minerales > 0) {
      onAchievementEvent({
        type: "increment",
        key: "MINERALS_COLLECTED",
        amount: minerales,
      });
    }

    const energy = Math.max(0, delta.ENERGY ?? 0);
    if (energy > 0) {
      onAchievementEvent({
        type: "increment",
        key: "ENERGY_PRODUCED",
        amount: energy,
      });
    }

    const specials =
      Math.max(0, delta.AETHERIUM ?? 0) +
      Math.max(0, delta.ILMENITA ?? 0) +
      Math.max(0, delta.KAIROX ?? 0) +
      Math.max(0, delta.NEBULITA ?? 0) +
      Math.max(0, delta.THARNIO ?? 0);
    if (specials > 0) {
      onAchievementEvent({
        type: "increment",
        key: "SPECIAL_RESOURCES_COLLECTED_TOTAL",
        amount: specials,
      });
    }
    await saveResources(updatedState);
  };

  const addResources = async (modifications: Partial<CombinedResources>) => {
    const now = Date.now();
    const prev = resources;

    const { resources: updated, delta } = getAccumulatedResources(resources);

    for (const key in modifications) {
      const typedKey = key as keyof CombinedResources;
      updated[typedKey] = (updated[typedKey] || 0) + (modifications[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      resources: updated as CombinedResources,
      lastUpdate: now,
      production: prev.production,
    };

    setResources(updatedState);
    await saveResources(updatedState);

    const minerales = Math.max(0, delta.STONE ?? 0);
    if (minerales > 0) {
      onAchievementEvent({
        type: "increment",
        key: "MINERALS_COLLECTED",
        amount: minerales,
      });
    }

    const energy = Math.max(0, delta.ENERGY ?? 0);
    if (energy > 0) {
      onAchievementEvent({
        type: "increment",
        key: "ENERGY_PRODUCED",
        amount: energy,
      });
    }

    const specials =
      Math.max(0, delta.AETHERIUM ?? 0) +
      Math.max(0, delta.ILMENITA ?? 0) +
      Math.max(0, delta.KAIROX ?? 0) +
      Math.max(0, delta.NEBULITA ?? 0) +
      Math.max(0, delta.THARNIO ?? 0);
    if (specials > 0) {
      onAchievementEvent({
        type: "increment",
        key: "SPECIAL_RESOURCES_COLLECTED_TOTAL",
        amount: specials,
      });
    }
  };

  const addProduction = async (
    extraProduction: Partial<CombinedResources>,
    effectiveAt: number
  ) => {
    const targetTime = Math.min(effectiveAt, Date.now());

    setResources((prev) => {
      const { resources: accumulated, delta } = getAccumulatedResources(prev, targetTime);

      const newProduction: Partial<CombinedResources> = { ...prev.production };
      for (const key in extraProduction) {
        const k = key as keyof CombinedResources;
        newProduction[k] = (newProduction[k] || 0) + (extraProduction[k] || 0);
      }

      const next: StoredResources = {
        ...prev,
        resources: accumulated,
        production: newProduction,
        lastUpdate: targetTime,
      };

      saveResources(next).catch(() => {});

      const minerales = Math.max(0, delta.STONE ?? 0);
      if (minerales > 0) {
        onAchievementEvent({
          type: "increment",
          key: "MINERALS_COLLECTED",
          amount: minerales,
        });
      }

      const energy = Math.max(0, delta.ENERGY ?? 0);
      if (energy > 0) {
        onAchievementEvent({
          type: "increment",
          key: "ENERGY_PRODUCED",
          amount: energy,
        });
      }

      const specials =
        Math.max(0, delta.AETHERIUM ?? 0) +
        Math.max(0, delta.ILMENITA ?? 0) +
        Math.max(0, delta.KAIROX ?? 0) +
        Math.max(0, delta.NEBULITA ?? 0) +
        Math.max(0, delta.THARNIO ?? 0);
      if (specials > 0) {
        onAchievementEvent({
          type: "increment",
          key: "SPECIAL_RESOURCES_COLLECTED_TOTAL",
          amount: specials,
        });
      }
      return next;
    });
  };

  const enoughResources = (cost: Partial<CombinedResources>) => {
    const effectiveResources: Partial<CombinedResources> = {};
    for (const key in resources.resources) {
      const typedKey = key as keyof CombinedResources;
      effectiveResources[typedKey] =
        (resources.resources[typedKey] || 0) - (reservedRef.current[typedKey] || 0);
    }

    return hasEnoughResources(
      {
        ...resources,
        resources: effectiveResources as CombinedResources,
      },
      cost
    );
  };

  return {
    resources,
    resetResources,
    addResources,
    subtractResources,
    addProduction,
    enoughResources,
  };
}
