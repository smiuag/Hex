import { shipConfig } from "@/src/config/shipConfig";
import { FleetData, MovementType } from "@/src/types/fleetType";
import { ShipType } from "@/src/types/shipType";
import { getFlyTime } from "@/utils/shipUtils";
import { useEffect, useState } from "react";
import uuid from "react-native-uuid";
import {
  deleteStarSystem,
  loadFleet,
  loadStarSystem,
  saveFleet,
  saveStarSystem,
} from "../src/services/storage";
import { StarSystem } from "../src/types/starSystemTypes";
import { generateInitialSystems } from "../utils/starSystemUtils";

export const useStarSystem = (
  handleDestroyShip: (type: ShipType, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipType; amount: number }[]) => void
) => {
  const [starSystems, setPlayerStarSystems] = useState<StarSystem[]>([]);
  const [fleet, setFleet] = useState<FleetData[]>([]);

  //FLEET

  const updateFleet = async (updatedFleet: FleetData[]) => {
    setFleet(updatedFleet);
    await saveFleet(updatedFleet);
  };

  const loadFleetData = async () => {
    const saved = await loadFleet();
    if (saved) {
      setFleet(saved);
    }
  };

  const newFleet = async (newFleet: FleetData) => {
    newFleet.ships.forEach((ship) => {
      handleDestroyShip(ship.type, ship.amount);
    });

    const updated = [...fleet, newFleet];
    updateFleet(updated);
  };

  const cancelFleet = async (id: string, currentFleet: FleetData[]): Promise<FleetData[]> => {
    const now = Date.now();

    const updatedFleet = currentFleet.map((f) => {
      if (f.id !== id) return f;

      const timeSpent = now - f.startTime;

      return {
        ...f,
        startTime: now,
        endTime: now + timeSpent,
        destination: f.origin,
        origin: f.destination,
        movementType: "RETURN" as MovementType,
      };
    });
    console.log(updatedFleet);
    return updatedFleet;
  };

  const destroyFleet = async (id: string, currentFleet: FleetData[]): Promise<FleetData[]> => {
    const updated = currentFleet.filter((f) => f.id !== id);
    return updated;
  };

  const resetFleet = async () => {
    await updateFleet([]);
  };

  const processFleeTick = async () => {
    const now = Date.now();
    let changed = false;

    let workingFleet = [...fleet];
    let workingSystems = [...starSystems];
    const shipsToCreateMap: Partial<Record<ShipType, number>> = {};

    for (let i = workingFleet.length - 1; i >= 0; i--) {
      const f = workingFleet[i];
      if (f.endTime > now) continue;
      changed = true;

      switch (f.movementType) {
        case "RETURN":
          // Acumula los ships que deben ser recreados
          f.ships.forEach((ship) => {
            if (!shipsToCreateMap[ship.type]) {
              shipsToCreateMap[ship.type] = 0;
            }
            shipsToCreateMap[ship.type] = (shipsToCreateMap[ship.type] ?? 0) + ship.amount;
          });

          workingFleet = await destroyFleet(f.id, workingFleet);
          break;

        case "EXPLORE SYSTEM":
          const { updatedFleet, updatedSystems } = await exploreStarSystem(
            f.destination,
            workingFleet,
            workingSystems
          );
          workingFleet = updatedFleet;
          workingSystems = updatedSystems;
          break;

        default:
          console.warn(`Unhandled movement type: ${f.movementType}`);
      }
    }

    const shipsToCreate = Object.entries(shipsToCreateMap).map(([type, amount]) => ({
      type: type as ShipType,
      amount,
    }));

    if (changed) {
      if (shipsToCreate.length > 0) await handleCreateShips(shipsToCreate);
      await updateFleet(workingFleet);
      await updateSystems(workingSystems);
    }
  };

  //STAR SYSTEM

  const updateSystems = async (systems: StarSystem[]) => {
    setPlayerStarSystems(systems);
    await saveStarSystem(systems);
  };

  const discardStarSystem = async (id: string) => {
    const updated = starSystems.filter((system) => system.id !== id);
    await updateSystems(updated);
  };

  const startStarSystemExploration = async (id: string) => {
    const system = starSystems.find((system) => system.id == id);
    if (system) {
      const probeSpeed = shipConfig["PROBE"].speed;
      const timeToExplore = getFlyTime(probeSpeed, system!.distance);
      const fleetData: FleetData = {
        destination: id,
        endTime: Date.now() + timeToExplore,
        movementType: "EXPLORE SYSTEM",
        origin: "PLANET",
        ships: [{ type: "PROBE", amount: 1 }],
        startTime: Date.now(),
        id: uuid.v4(),
      };
      newFleet(fleetData);
      const updated = starSystems.map((system) =>
        system.id === id
          ? { ...system, explorationStartedAt: Date.now(), explorationFleetId: fleetData.id }
          : system
      );
      await updateSystems(updated);
    }
  };

  const exploreStarSystem = async (
    id: string,
    currentFleet: FleetData[],
    currentSystems: StarSystem[]
  ): Promise<{
    updatedFleet: FleetData[];
    updatedSystems: StarSystem[];
  }> => {
    const system = currentSystems.find((s) => s.id === id);
    if (!system) {
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }

    const updatedSystems = currentSystems.map((s) => (s.id === id ? { ...s, explored: true } : s));

    let updatedFleet = [...currentFleet];

    if (system.defense.length > 0) {
      updatedFleet = updatedFleet.filter((f) => f.id !== system.explorationFleetId);
    } else {
      updatedFleet = updatedFleet.map((f) =>
        f.id !== system.explorationFleetId
          ? f
          : {
              ...f,
              startTime: Date.now(),
              endTime: Date.now() + (f.endTime - f.startTime),
              destination: f.origin,
              origin: f.destination,
              movementType: "RETURN",
            }
      );
    }

    return { updatedFleet, updatedSystems };
  };

  const explorePlanet = async (systemId: string, planetId: string) => {
    // const fleetData: FleetData = {
    //   destination: planetId,
    //   endTime: 1,
    //   movementType: "EXPLORE PLANET",
    //   origin: "PLANET",
    //   ships: [{ type: "PROBE", amount: 1 }],
    //   startTime: Date.now(),
    //   id: uuid.v4(),
    // };

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
    const system = starSystems.find((s) => s.id === id);
    if (!system || !system.explorationFleetId) return;

    const updatedFleet = await cancelFleet(system.explorationFleetId, fleet);

    const updated = starSystems.map((s) =>
      s.id === id ? { ...s, explorationFleetId: undefined, explorationStartedAt: undefined } : s
    );

    await updateFleet(updatedFleet);
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
    loadFleetData();
  }, []);

  return {
    starSystems,
    fleet,
    startStarSystemExploration,
    cancelExploreSystem,
    resetStarSystem,
    discardStarSystem,
    explorePlanet,
    processFleeTick,
    newFleet,
    cancelFleet,
    resetFleet,
  };
};
