import { useEffect, useState } from "react";
import { starSystemTypeProbabilities } from "../src/constants/starSystem";
import { deleteStarSystem, loadStarSystem, saveStarSystem } from "../src/services/storage";
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

  const updateStarSystems = async (starSystem: StarSystem[]) => {
    setPlayerStarSystems(starSystem);
    await saveStarSystem(starSystem);
  };

  const loadStarSystems = async () => {
    const saved = await loadStarSystem();
    if (saved && saved.length > 0) {
      setPlayerStarSystems(saved);
    } else {
      const generated = generateInitialSystems();
      setPlayerStarSystems(generated);
      await saveStarSystem(generated);
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
    updateStarSystems,
    loadStarSystem,
    resetStarSystem,
    starSystems,
  };
};
