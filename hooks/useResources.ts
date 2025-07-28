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
    const now = Date.now();
    setResources((prev) => {
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

      saveResources(updatedState);
      return updatedState;
    });
  };

  const addResources = async (modifications: Partial<Resources>) => {
    const now = Date.now();
    setResources((prev) => {
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

      saveResources(updatedState);
      return updatedState;
    });
  };

  const addProduction = async (extraProduction: Partial<Resources>) => {
    setResources((prev) => {
      const updatedProduction: Partial<Resources> = { ...prev.production };

      for (const key in extraProduction) {
        const typedKey = key as keyof Resources;
        updatedProduction[typedKey] =
          (updatedProduction[typedKey] || 0) + (extraProduction[typedKey] || 0);
      }

      const updatedState: StoredResources = {
        ...prev,
        production: updatedProduction,
      };

      saveResources(updatedState);
      return updatedState;
    });
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
