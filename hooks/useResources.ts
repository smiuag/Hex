import { loadResources, saveResources } from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { CombinedResources, StoredResources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import { getInitialResources } from "../utils/hexUtils";
import { getAccumulatedResources, hasEnoughResources } from "../utils/resourceUtils";

export function useResources(onAchievementEvent: (ev: AchievementEvent) => void) {
  const [resources, setResources] = useState<StoredResources>(getInitialResources());
  const resourcesRef = useRef<StoredResources>(resources);

  // Cola para serializar guardados y evitar escrituras fuera de orden
  const saveChain = useRef(Promise.resolve());
  // Evitar guardar justo al hidratar desde storage
  const hydrated = useRef(false);

  // Mantener el ref siempre en sync
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  // Hidratar desde storage
  useEffect(() => {
    const load = async () => {
      const saved = await loadResources();
      if (saved) {
        resourcesRef.current = saved;
        setResources(saved);
      }
    };
    load();
  }, []);

  // Persistir cada cambio en serie y en orden
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const snapshot = resourcesRef.current;
    saveChain.current = saveChain.current
      .then(() => saveResources(snapshot))
      .catch((e) => console.error("Error saving resources:", e));
  }, [resources]);

  const resetResources = async () => {
    const initial = getInitialResources();
    resourcesRef.current = initial;
    setResources(initial);
  };

  const subtractResources = async (modifications: Partial<CombinedResources>) => {
    setResources((prev) => {
      const now = Date.now();
      const { resources: updated, delta } = getAccumulatedResources(prev);

      for (const key in modifications) {
        const k = key as keyof CombinedResources;
        updated[k] = (updated[k] || 0) - (modifications[k] || 0);
      }

      const next: StoredResources = {
        resources: updated as CombinedResources,
        lastUpdate: now,
        production: prev.production,
      };

      // Logros a partir de lo producido en la acumulación
      const minerales = Math.max(0, delta.STONE ?? 0);
      if (minerales > 0) {
        onAchievementEvent({ type: "increment", key: "MINERALS_COLLECTED", amount: minerales });
      }

      const energy = Math.max(0, delta.ENERGY ?? 0);
      if (energy > 0) {
        onAchievementEvent({ type: "increment", key: "ENERGY_PRODUCED", amount: energy });
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

      resourcesRef.current = next;
      return next;
    });
  };

  const addResources = async (modifications: Partial<CombinedResources>) => {
    setResources((prev) => {
      const now = Date.now();
      const { resources: updated, delta } = getAccumulatedResources(prev);

      for (const key in modifications) {
        const k = key as keyof CombinedResources;
        updated[k] = (updated[k] || 0) + (modifications[k] || 0);
      }

      const next: StoredResources = {
        resources: updated as CombinedResources,
        lastUpdate: now,
        production: prev.production,
      };

      const minerales = Math.max(0, delta.STONE ?? 0);
      if (minerales > 0) {
        onAchievementEvent({ type: "increment", key: "MINERALS_COLLECTED", amount: minerales });
      }

      const energy = Math.max(0, delta.ENERGY ?? 0);
      if (energy > 0) {
        onAchievementEvent({ type: "increment", key: "ENERGY_PRODUCED", amount: energy });
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

      resourcesRef.current = next;
      return next;
    });
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

      resourcesRef.current = next;
      return next;
    });
  };

  // Chequeo con el ref más reciente
  const enoughResources = (cost: Partial<CombinedResources>) => {
    return hasEnoughResources(resourcesRef.current, cost);
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
