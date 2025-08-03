import { loadResources, saveResources } from "@/src/services/storage";
import { Resources, StoredResources } from "@/src/types/resourceTypes";
import { useEffect, useRef, useState } from "react";
import { getInitialResources } from "../utils/hexUtils";
import { hasEnoughResources } from "../utils/resourceUtils";

export function useResources() {
  const [resources, setResources] = useState<StoredResources>(getInitialResources());

  const reservedRef = useRef<Partial<Resources>>({});

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

  const releaseResources = (cost: Partial<Resources>) => {
    for (const key in cost) {
      const typedKey = key as keyof Resources;
      reservedRef.current[typedKey] = Math.max(
        0,
        (reservedRef.current[typedKey] || 0) - (cost[typedKey] || 0)
      );
    }
  };

  const subtractResources = async (modifications: Partial<Resources>) => {
    releaseResources(modifications);

    const now = Date.now();
    const prev = resources;
    const elapsedSeconds = (now - prev.lastUpdate) / 1000;
    const updated: Partial<Resources> = { ...prev.resources };

    for (const key in prev.production) {
      const typedKey = key as keyof Resources;
      const produced = (prev.production[typedKey] || 0) * elapsedSeconds;
      updated[typedKey] = (updated[typedKey] || 0) + produced;
    }

    for (const key in modifications) {
      const typedKey = key as keyof Resources;
      updated[typedKey] = (updated[typedKey] || 0) - (modifications[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      resources: updated as Resources,
      lastUpdate: now,
      production: prev.production,
    };

    setResources(updatedState);
    await saveResources(updatedState);
  };

  const addResources = async (modifications: Partial<Resources>) => {
    const now = Date.now();
    const prev = resources;
    const elapsedSeconds = (now - prev.lastUpdate) / 1000;
    const updated: Partial<Resources> = { ...prev.resources };

    for (const key in prev.production) {
      const typedKey = key as keyof Resources;
      const produced = (prev.production[typedKey] || 0) * elapsedSeconds;
      updated[typedKey] = (updated[typedKey] || 0) + produced;
    }

    for (const key in modifications) {
      const typedKey = key as keyof Resources;
      updated[typedKey] = (updated[typedKey] || 0) + (modifications[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      resources: updated as Resources,
      lastUpdate: now,
      production: prev.production,
    };

    setResources(updatedState);
    await saveResources(updatedState);
  };

  const addProduction = async (extraProduction: Partial<Resources>) => {
    const updatedProduction: Partial<Resources> = { ...resources.production };

    for (const key in extraProduction) {
      const typedKey = key as keyof Resources;
      updatedProduction[typedKey] =
        (updatedProduction[typedKey] || 0) + (extraProduction[typedKey] || 0);
    }

    const updatedState: StoredResources = {
      ...resources,
      production: updatedProduction,
    };

    setResources(updatedState);
    await saveResources(updatedState);
  };

  const enoughResources = (cost: Partial<Resources>) => {
    const effectiveResources: Partial<Resources> = {};
    for (const key in resources.resources) {
      const typedKey = key as keyof Resources;
      effectiveResources[typedKey] =
        (resources.resources[typedKey] || 0) - (reservedRef.current[typedKey] || 0);
    }

    return hasEnoughResources(
      {
        ...resources,
        resources: effectiveResources as Resources,
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
