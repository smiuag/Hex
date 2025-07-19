import { useEffect, useRef, useState } from "react";
import { loadResources, saveResources } from "../src/services/storage";
import { Hex } from "../src/types/hexTypes";
import { StoredResources } from "../src/types/resourceTypes";
import { getInitialResources } from "../utils/mapUtils";
import { accumulateResources } from "../utils/resourceUtils";

export function useResources(hexes: Hex[]) {
  const [resources, setResources] = useState<StoredResources>(
    getInitialResources()
  );
  const [ready, setReady] = useState(false);
  const resourcesRef = useRef<StoredResources>(resources);

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  useEffect(() => {
    if (hexes.length === 0 || ready) return;

    const load = async () => {
      const saved = await loadResources();

      if (saved) {
        const now = Date.now();
        const diff = now - saved.lastUpdate;

        const updated =
          diff > 1000 ? accumulateResources(hexes, saved, diff) : saved;

        setResources(updated);
        resourcesRef.current = updated;

        if (diff > 1000) {
          await saveResources(updated);
        }
      } else {
        const initial = getInitialResources();
        setResources(initial);
        resourcesRef.current = initial;
        await saveResources(initial);
      }

      setReady(true);
    };

    load();
  }, [hexes, ready]);

  const updateNow = () => {
    if (!ready) return;

    const updated = accumulateResources(hexes, resourcesRef.current);

    if (
      JSON.stringify(resourcesRef.current.resources) !==
      JSON.stringify(updated.resources)
    ) {
      setResources(updated);
      resourcesRef.current = updated;
      saveResources(updated);
    }
  };

  const resetResources = () => {
    const initial = getInitialResources();
    setResources(initial);
    resourcesRef.current = initial;
    saveResources(initial);
  };

  return {
    resources,
    setResources,
    updateNow,
    resetResources,
    resourcesRef,
    ready,
  };
}
