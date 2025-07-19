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

  // 🔍 Log de montaje
  useEffect(() => {
    console.log("[useResources] Hook montado");
  }, []);

  // 🔄 Mantener actualizado el ref de recursos
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  // 🚀 Cargar recursos al arrancar
  useEffect(() => {
    if (hexCount === 0 || ready) {
      console.log(
        "[useResources] ⛔ hexes vacíos o ya listos, no se carga nada"
      );
      return;
    }

    console.log("[useResources] ⏳ Cargando recursos...");

    const load = async () => {
      const saved = await loadResources();

      if (saved) {
        const now = Date.now();
        const diff = now - saved.lastUpdate;

        console.log("[useResources] 📦 Recursos guardados encontrados");
        console.log("[useResources] ⏱️ Tiempo transcurrido:", diff, "ms");

        const updated =
          diff > 1000
            ? accumulateResources(hexesRef.current, saved, diff)
            : saved;

        setResources(updated);
        resourcesRef.current = updated;

        if (diff > 1000) {
          console.log("[useResources] 💾 Guardando recursos actualizados");
          await saveResources(updated);
        }
      } else {
        console.log("[useResources] 🆕 Inicializando nuevos recursos");
        const initial = getInitialResources();
        setResources(initial);
        resourcesRef.current = initial;
        await saveResources(initial);
      }

      setReady(true);
      console.log("[useResources] ✅ Hook listo");
    };

    load();
  }, [hexCount, ready]);

  // 🔁 Intervalo para actualizar cada segundo
  useEffect(() => {
    if (!ready) return;

    console.log("[useResources] ⏱️ Iniciando intervalo");

    const interval = setInterval(() => {
      updateNow();
    }, 1000);

    return () => {
      console.log("[useResources] ⏹️ Limpiando intervalo");
      clearInterval(interval);
    };
  }, [ready]);

  const updateNow = () => {
    if (!ready) {
      console.log("[useResources] ⛔ updateNow ignorado (no está listo)");
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
      console.log("[useResources] 🔄 Recursos actualizados:", next);
      setResources(updated);
      resourcesRef.current = updated;
      saveResources(updated);
    } else {
      console.log("[useResources] ✅ Recursos sin cambios");
    }
  };

  const resetResources = () => {
    console.log("[useResources] ♻️ Reiniciando recursos");
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
