import universeFlatRaw from "@/src/data/universe.json";
import { StarSystemMap } from "@/src/types/starSystemTypes";
import { useMemo } from "react";

export const useUniverse = (): { universe: StarSystemMap } => {
  const universe = useMemo(() => {
    return universeFlatRaw as StarSystemMap;
  }, []);

  return { universe };
};
