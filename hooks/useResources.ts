import { useEffect, useRef, useState } from "react";
import { loadResources, saveResources } from "../src/services/storage";
import { Resources, StoredResources } from "../src/types/resourceTypes";
import { getInitialResources } from "../utils/hexUtils";
import { hasEnoughResources } from "../utils/resourceUtils";

export function useResources() {
  const [resources, setResources] = useState<StoredResources>(getInitialResources());
  const [reservedResources, setReservedResources] = useState<Partial<Resources>>({});

  // Ref mutable para acceso inmediato y consistente a reservas
  const reservedRef = useRef<Partial<Resources>>({});
  useEffect(() => {
    reservedRef.current = reservedResources;
  }, [reservedResources]);

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
    setReservedResources({});
    reservedRef.current = {};
    await saveResources(initial);
  };

  // Intentar reservar recursos, devuelve true si pudo reservar, false si no hay suficiente
  const tryReserveResources = (cost: Partial<Resources>): boolean => {
    // Calcula recursos disponibles descontando los reservados actuales
    const effectiveResources: Partial<Resources> = {};
    for (const key in resources.resources) {
      const typedKey = key as keyof Resources;
      effectiveResources[typedKey] =
        (resources.resources[typedKey] || 0) - (reservedRef.current[typedKey] || 0);
    }

    if (!hasEnoughResources({ resources: effectiveResources } as StoredResources, cost)) {
      return false;
    }

    // Reserva incrementando la ref y el estado
    const newReserved = { ...reservedRef.current };
    for (const key in cost) {
      const typedKey = key as keyof Resources;
      newReserved[typedKey] = (newReserved[typedKey] || 0) + (cost[typedKey] || 0);
    }
    reservedRef.current = newReserved;
    setReservedResources(newReserved);

    return true;
  };

  // Resta recursos reales y libera la reserva correspondiente
  const subtractResources = async (modifications: Partial<Resources>) => {
    // Liberar reservas
    const newReserved = { ...reservedRef.current };
    for (const key in modifications) {
      const typedKey = key as keyof Resources;
      newReserved[typedKey] = Math.max(
        0,
        (newReserved[typedKey] || 0) - (modifications[typedKey] || 0)
      );
    }
    reservedRef.current = newReserved;
    setReservedResources(newReserved);

    const now = Date.now();
    return new Promise<void>((resolve, reject) => {
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

        saveResources(updatedState)
          .then(() => resolve())
          .catch((e) => reject(e));

        return updatedState;
      });
    });
  };

  const addResources = async (modifications: Partial<Resources>) => {
    const now = Date.now();
    return new Promise<void>((resolve, reject) => {
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

        saveResources(updatedState)
          .then(() => resolve())
          .catch((e) => reject(e));

        return updatedState;
      });
    });
  };

  const addProduction = async (extraProduction: Partial<Resources>) => {
    return new Promise<void>((resolve, reject) => {
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

        saveResources(updatedState)
          .then(() => resolve())
          .catch((e) => reject(e));

        return updatedState;
      });
    });
  };

  // Considera los recursos disponibles descontando la reserva
  const enoughResources = (cost: Partial<Resources>) => {
    const effectiveResources: Partial<Resources> = {};
    for (const key in resources.resources) {
      const typedKey = key as keyof Resources;
      effectiveResources[typedKey] =
        (resources.resources[typedKey] || 0) - (reservedRef.current[typedKey] || 0);
    }

    // Construimos un StoredResources válido con production y lastUpdate de resources actuales
    const currentStoredResources: StoredResources = {
      resources: effectiveResources as Resources,
      production: resources.production,
      lastUpdate: resources.lastUpdate,
    };

    const enough = hasEnoughResources(currentStoredResources, cost);

    return enough;
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
