import { useEffect, useState } from "react";
import { starSystemTypeProbabilities } from "../src/constants/starSystem";
import {
  deleteStarSystem,
  loadStarSystem,
  markStarSystemAsExplored,
  saveStarSystem,
} from "../src/services/storage";
import { StarSystem, StarSystemType } from "../src/types/starSystemTypes";
import { generateStarSystem } from "../utils/starSystemUtils";

export const useStarSystem = () => {
  const [starSystems, setPlayerStarSystems] = useState<StarSystem[]>([]);

  // Selecciona un tipo de sistema aleatorio basado en las probabilidades
  const pickRandomStarSystemType = (): StarSystemType => {
    const rand = Math.random();
    let cumulative = 0;
    for (const [type, prob] of Object.entries(starSystemTypeProbabilities)) {
      cumulative += prob;
      if (rand <= cumulative) return type as StarSystemType;
    }
    return "RED_DWARF";
  };

  const generateInitialSystems = (): StarSystem[] => {
    return Array.from({ length: 3 }, () => generateStarSystem(pickRandomStarSystemType()));
  };

  const discardStarSystem = async (id: string) => {
    const updated = starSystems.filter((system) => system.id !== id);
    setPlayerStarSystems(updated);
    await saveStarSystem(updated);
  };
  const exploreStarSystem = async (id: string) => {
    const updated = starSystems.map((system) =>
      system.id === id ? { ...system, explored: true } : system
    );
    setPlayerStarSystems(updated);
    markStarSystemAsExplored(id);
  };

  const loadStarSystems = async () => {
    const saved = await loadStarSystem();
    if (saved && saved.length > 0) {
      setPlayerStarSystems(saved);
    } else {
      const generated = generateInitialSystems();
      await saveStarSystem(generated);
      setPlayerStarSystems(generated);
    }
  };

  const resetStarSystem = async () => {
    await deleteStarSystem();
    setPlayerStarSystems([]);
  };

  useEffect(() => {
    loadStarSystems();
  }, []);

  return {
    resetStarSystem,
    discardStarSystem,
    exploreStarSystem,
    starSystems,
  };
};
