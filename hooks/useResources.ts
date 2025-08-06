import { loadResources, saveResources } from "@/src/services/storage";
import { CombinedResources, StoredResources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import { getInitialResources } from "../utils/hexUtils";
import { getAccumulatedResources, hasEnoughResources } from "../utils/resourceUtils";

export function useResources() {
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
    const updated = getAccumulatedResources(resources);

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
    await saveResources(updatedState);
  };

  const addResources = async (modifications: Partial<CombinedResources>) => {
    const now = Date.now();
    const prev = resources;
    const updated = getAccumulatedResources(resources);

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
  };

  const addProduction = async (extraProduction: Partial<CombinedResources>) => {
    const updatedProduction: Partial<CombinedResources> = { ...resources.production };
    const updated = getAccumulatedResources(resources);

    for (const key in extraProduction) {
      const typedKey = key as keyof CombinedResources;
      updatedProduction[typedKey] =
        (updatedProduction[typedKey] || 0) + (extraProduction[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      ...resources,
      resources: updated,
      lastUpdate: Date.now(),
      production: updatedProduction,
    };

    setResources(updatedState);
    await saveResources(updatedState);
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
