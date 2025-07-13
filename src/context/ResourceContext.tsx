import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StoredResources } from "../../data/tipos";
import { initialResources } from "../../utils/mapGenerator";
import { accumulateResources } from "../../utils/resourceUtils";
import { loadResources, saveResources } from "../services/storage";
import { useMap } from "./MapContext";

type ResourceContextType = {
  resources: StoredResources;
  updateNow: () => void;
  setResources: React.Dispatch<React.SetStateAction<StoredResources>>;
};

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export const ResourceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ready, setReady] = useState(false);
  const [resources, setResources] = useState<StoredResources>(initialResources);
  const { hexes } = useMap();
  const resourcesRef = useRef<StoredResources>(initialResources);

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  const updateNow = () => {
    const updated = accumulateResources(hexes, resourcesRef.current);
    setResources(updated);
    resourcesRef.current = updated;
    saveResources(updated);
  };

  // Carga inicial
  useEffect(() => {
    if (hexes.length === 0) return;

    const load = async () => {
      const saved = await loadResources();

      if (saved) {
        const now = Date.now();
        const diff = now - saved.lastUpdate;

        if (diff > 1000) {
          const updated = accumulateResources(hexes, saved, diff);
          setResources(updated);
          await saveResources(updated);
        } else {
          setResources(saved);
        }
      } else {
        setResources(initialResources);
        await saveResources(initialResources);
      }

      setReady(true); // todo cargado, activamos el ticker
    };

    load();
  }, [hexes]);

  useEffect(() => {
    if (!ready) return; //Para esperar que la carga inicial esté completada

    const interval = setInterval(() => {
      updateNow();
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, hexes]);

  return (
    <ResourceContext.Provider value={{ resources, updateNow, setResources }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context)
    throw new Error("useResources debe usarse dentro de ResourceProvider");
  return context;
};
