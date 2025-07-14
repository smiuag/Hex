// MapContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BuildingType, Hex } from "../../data/tipos";
import { getBuildTime } from "../../utils/helpers";
import { normalizeHexMap } from "../../utils/mapNormalizer";
import { loadMap, saveMap } from "../services/storage";

type MapContextType = {
  hexes: Hex[];
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>;
  reloadMap: () => Promise<void>;
  saveMapToStorage: (map: Hex[]) => Promise<void>;
  processConstructionTick: () => void;
  handleBuild: (q: number, r: number, type: BuildingType) => void;
  handleCancelBuild: (q: number, r: number) => void;
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

  const handleBuild = (q: number, r: number, type: BuildingType) => {
    const updated = hexes.map((hex) => {
      if (hex.q === q && hex.r === r) {
        const currentLevel =
          hex.building?.type === type ? hex.building.level : 0;
        return {
          ...hex,
          previousBuilding: hex.building ?? null,
          construction: {
            building: type,
            startedAt: Date.now(),
            targetLevel: currentLevel + 1,
          },
          building: null,
        };
      }
      return hex;
    });

    setHexes(updated);
    saveMapToStorage(updated);
  };

  const handleCancelBuild = async (q: number, r: number) => {
    const updated = hexes.map((hex) => {
      if (hex.q === q && hex.r === r) {
        const { construction, previousBuilding, ...rest } = hex;
        return {
          ...rest,
          construction: undefined,
          building: previousBuilding ?? null,
          previousBuilding: undefined,
        };
      }
      return hex;
    });

    setHexes(updated);
    await saveMapToStorage(updated);
  };

  return (
    <MapContext.Provider
      value={{
        hexes,
        setHexes,
        reloadMap,
        saveMapToStorage,
        processConstructionTick,
        handleBuild,
        handleCancelBuild,
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
