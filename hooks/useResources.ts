import { useEffect, useRef, useState } from "react";
import { loadResources, saveResources } from "../src/services/storage";
import { Hex } from "../src/types/hexTypes";
import { StoredResources } from "../src/types/resourceTypes";
import { getInitialResources } from "../utils/mapUtils";
import { accumulateResources } from "../utils/resourceUtils";

export function useResources(hexesRef: React.RefObject<Hex[]>) {
  const [resources, setResources] = useState<StoredResources>(
    getInitialResources()
  );
  const [ready, setReady] = useState(false);
  const resourcesRef = useRef<StoredResources>(resources);
  const hexCount = hexesRef.current.length;

  // 🔄 Mantener actualizado el ref de recursos
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  // 🚀 Cargar recursos al arrancar
  useEffect(() => {
    if (hexCount === 0 || ready) {
      return;
    }

    const load = async () => {
      const saved = await loadResources();

      if (saved) {
        const now = Date.now();
        const diff = now - saved.lastUpdate;

        const updated =
          diff > 1000
            ? accumulateResources(hexesRef.current, saved, diff)
            : saved;

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
  }, [hexCount, ready]);

  // 🔁 Intervalo para actualizar cada segundo
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      updateNow();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ready]);

  const updateNow = () => {
    if (!ready) {
      return;
    }

    const updated = accumulateResources(hexesRef.current, resourcesRef.current);
    const prev = resourcesRef.current.resources;
    const next = updated.resources;

    const hasChanged = Object.keys(next).some((key) => {
      const typedKey = key as keyof typeof next;
      return prev[typedKey] !== next[typedKey];
    });

    if (hasChanged) {
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
