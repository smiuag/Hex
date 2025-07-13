// MapContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Hex } from "../../data/tipos";
import { getBuildTime } from "../../utils/helpers";
import { normalizeHexMap } from "../../utils/mapNormalizer";
import { loadMap, saveMap } from "../services/storage";

type MapContextType = {
  hexes: Hex[];
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>;
  reloadMap: () => Promise<void>;
  saveMapToStorage: (map: Hex[]) => Promise<void>;
  processConstructionTick: () => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const hexesRef = useRef<Hex[]>([]);

  const reloadMap = async () => {
    const saved = await loadMap();
    const normalized = saved ? normalizeHexMap(saved) : [];
    setHexes(normalized);
    hexesRef.current = normalized;
  };

  const saveMapToStorage = async (map: Hex[]) => {
    setHexes(map);
    hexesRef.current = map;
    await saveMap(map);
  };
  const processConstructionTick = () => {
    const now = Date.now();
    let changed = false;

    const updated = hexesRef.current.map((hex) => {
      if (hex.construction) {
        const { building, startedAt, targetLevel } = hex.construction;
        const buildTime = getBuildTime(building, targetLevel);

        if (now - startedAt >= buildTime) {
          changed = true;
          return {
            ...hex,
            construction: undefined,
            building: {
              type: building,
              level: targetLevel,
            },
          };
        }
      }
      return hex;
    });

    if (changed) {
      setHexes(updated);
      hexesRef.current = updated;
      saveMap(updated);
    }
  };

  useEffect(() => {
    reloadMap();
    const interval = setInterval(() => {
      processConstructionTick();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContext.Provider
      value={{
        hexes,
        setHexes,
        reloadMap,
        saveMapToStorage,
        processConstructionTick, // ← aquí también
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap debe usarse dentro de MapProvider");
  return context;
};
