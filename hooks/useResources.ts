import { useEffect, useState } from "react";
import { loadResources, saveResources } from "../src/services/storage";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getInitialResources } from "../utils/hexUtils";
import { hasEnoughResources } from "../utils/resourceUtils";

export function useResources() {
  const [resources, setResources] = useState<StoredResources>(getInitialResources());

  useEffect(() => {
    const load = async () => {
      const saved = await loadResources();
      setResources(saved);
    };
    load();
  }, []);

  const resetResources = async () => {
    const initial = getInitialResources();
    setResources(initial);
    await saveResources(initial);
  };

  const subtractResources = async (modifications: Partial<Resources>) => {
    const elapsedSeconds = (Date.now() - resources.lastUpdate) / 1000;
    const updatedResources: Partial<Resources> = { ...resources.resources };

    for (const key in resources.production) {
      const typedKey = key as keyof Resources;
      const produced = (resources.production[typedKey] || 0) * elapsedSeconds;
      updatedResources[typedKey] = (updatedResources[typedKey] || 0) + produced;
    }
    for (const key in modifications) {
      const typedKey = key as keyof Resources;
      updatedResources[typedKey] =
        (updatedResources[typedKey] || 0) - (modifications[typedKey] || 0);
    }

    const updatedStoredResources: StoredResources = {
      resources: updatedResources as Resources,
      lastUpdate: Date.now(),
      production: resources.production,
    };

    setResources(updatedStoredResources);
    await saveResources(updatedStoredResources);
  };

  const addResources = async (modifications: Partial<Resources>) => {
    const elapsedSeconds = (Date.now() - resources.lastUpdate) / 1000;
    const updatedResources: Partial<Resources> = { ...resources.resources };

    for (const key in resources.production) {
      const typedKey = key as keyof Resources;
      const produced = (resources.production[typedKey] || 0) * elapsedSeconds;
      updatedResources[typedKey] = (updatedResources[typedKey] || 0) + produced;
    }

    for (const key in modifications) {
      const typedKey = key as keyof Resources;
      updatedResources[typedKey] =
        (updatedResources[typedKey] || 0) + (modifications[typedKey] || 0);
    }

    const updatedStoredResources: StoredResources = {
      resources: updatedResources as Resources,
      lastUpdate: Date.now(),
      production: resources.production,
    };

    setResources(updatedStoredResources);
    await saveResources(updatedStoredResources);
  };

  const addProduction = async (extraProduction: Partial<Resources>) => {
    const updatedProduction: Partial<Resources> = { ...resources.production };

    for (const key in extraProduction) {
      const typedKey = key as keyof Resources;
      updatedProduction[typedKey] =
        (updatedProduction[typedKey] || 0) + (extraProduction[typedKey] || 0);
    }

    const updatedStoredResources: StoredResources = {
      ...resources,
      production: updatedProduction,
    };

    setResources(updatedStoredResources);
    await saveResources(updatedStoredResources);
  };

  const enoughResources = async (cost: Partial<Resources>) => {
    return hasEnoughResources(resources, cost);
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
