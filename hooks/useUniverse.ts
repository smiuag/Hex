import { useMemo } from "react";
import universeFlatRaw from "../src/data/universe.json";
import { ClusterMap, StarSystemDetected } from "../src/types/starSystemTypes";

const universeFlat = universeFlatRaw as Record<string, Omit<StarSystemDetected, "id">>;

export const useUniverse = () => {
  const universe = useMemo(() => {
    const parsed: ClusterMap = {};

    Object.entries(universeFlat).forEach(([id, sys]) => {
      const { cluster, galaxy, region } = sys;

      if (!parsed[cluster]) parsed[cluster] = {};
      if (!parsed[cluster][galaxy]) parsed[cluster][galaxy] = {};
      if (!parsed[cluster][galaxy][region]) parsed[cluster][galaxy][region] = [];

      parsed[cluster][galaxy][region].push({ ...sys, id });
    });

    return parsed;
  }, []);

  return { universe };
};
