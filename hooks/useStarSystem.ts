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

  const updateSystems = async (systems: StarSystem[]) => {
    setPlayerStarSystems(systems);
    await saveStarSystem(systems);
  };

  const generateInitialSystems = (): StarSystem[] => {
    return Array.from({ length: 3 }, () => generateStarSystem(pickRandomStarSystemType()));
  };

  const discardStarSystem = async (id: string) => {
    const updated = starSystems.filter((system) => system.id !== id);
    await updateSystems(updated);
  };

  const exploreStarSystem = async (id: string) => {
    const updated = starSystems.map((system) =>
      system.id === id ? { ...system, explorationStartedAt: Date.now() } : system
    );
    await updateSystems(updated);
  };

  const explorePlanet = async (systemId: string, planetId: string) => {
    const updatedSystems = starSystems.map((system) => {
      if (system.id !== systemId) return system;
      const updatedPlanets = system.planets.map((planet) =>
        planet.id === planetId
          ? { ...planet, explored: true, explorationStartedAt: Date.now() }
          : planet
      );

      return { ...system, planets: updatedPlanets };
    });

    await updateSystems(updatedSystems);
  };

  const cancelExploreSystem = async (id: string) => {
    const updated = starSystems.map((system) =>
      system.id === id ? { ...system, explorationStartedAt: undefined } : system
    );
    await updateSystems(updated);
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

  const processFlyTick = async () => {
    // const now = Date.now();
    // let changed = false;
    // const updatedResearch = starSystems.map((item) => {
    //   if (item.explorationStartedAt) {
    //     const totalTime = ge(item.data.type, item.progress.targetLevel);
    //     const elapsed = now - item.progress.startedAt;
    //     if (elapsed >= totalTime) {
    //       changed = true;
    //       Notifications.scheduleNotificationAsync({
    //         content: {
    //           title: "🧠 Investigación completada",
    //           body: `Has finalizado la investigación "${config.name}".`,
    //           sound: true,
    //         },
    //         trigger: null,
    //       });
    //       return {
    //         data: {
    //           type: item.data.type,
    //           level: item.progress.targetLevel,
    //         },
    //       };
    //     }
    //   }
    //   return item;
    // });
    // if (changed) {
    //   await updateResearchState(updatedResearch);
    // }
  };

  return {
    processFlyTick,
    cancelExploreSystem,
    resetStarSystem,
    discardStarSystem,
    exploreStarSystem,
    explorePlanet,
    starSystems,
  };
};
