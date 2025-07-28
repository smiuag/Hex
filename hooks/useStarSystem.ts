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

  const updateFleet = async (updater: FleetData[] | ((prev: FleetData[]) => FleetData[])) => {
    setFleet((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveFleet(next);
      return next;
    });
  };

  const updateSystems = async (updater: StarSystem[] | ((prev: StarSystem[]) => StarSystem[])) => {
    setPlayerStarSystems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStarSystem(next);
      return next;
    });
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

    await updateFleet((prev) => [...prev, newFleet]);
  };

  const cancelFleet = async (id: string, currentFleet: FleetData[]): Promise<FleetData[]> => {
    const now = Date.now();

    return currentFleet.map((f) => {
      if (f.id !== id) return f;

      const timeSpent = now - f.startTime;
      return {
        ...f,
        startTime: now,
        endTime: now + timeSpent,
        destinationSystemId: f.origin,
        origin: f.destinationSystemId,
        destinationPlanetId: undefined,
        movementType: "RETURN" as MovementType,
      };
    });
  };

  const destroyFleet = async (id: string, currentFleet: FleetData[]): Promise<FleetData[]> => {
    return currentFleet.filter((f) => f.id !== id);
  };

  const processFleeTick = async () => {
    const now = Date.now();
    let changed = false;

    let workingFleet = [...fleet];
    let workingSystems = [...starSystems];
    let result: { updatedFleet: FleetData[]; updatedSystems: StarSystem[] };
    const shipsToCreateMap: Partial<Record<ShipType, number>> = {};

    for (let i = workingFleet.length - 1; i >= 0; i--) {
      const f = workingFleet[i];
      if (f.endTime > now) continue;
      changed = true;

      switch (f.movementType) {
        case "RETURN":
          f.ships.forEach((ship) => {
            shipsToCreateMap[ship.type] = (shipsToCreateMap[ship.type] ?? 0) + ship.amount;
          });
          workingFleet = await destroyFleet(f.id, workingFleet);
          break;

        case "EXPLORE SYSTEM":
          result = await exploreStarSystem(f.destinationSystemId, workingFleet, workingSystems);
          workingFleet = result.updatedFleet;
          workingSystems = result.updatedSystems;
          break;

        case "EXPLORE PLANET":
          result = await explorePlanet(
            f.destinationSystemId,
            f.destinationPlanetId!,
            workingFleet,
            workingSystems
          );
          workingFleet = result.updatedFleet;
          workingSystems = result.updatedSystems;
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

  const discardStarSystem = async (id: string) => {
    await updateSystems((prev) => prev.filter((system) => system.id !== id));
  };

  const startStarSystemExploration = async (id: string) => {
    const system = starSystems.find((system) => system.id == id);
    if (!system) return;

    const probeSpeed = shipConfig["PROBE"].speed;
    const timeToExplore = getFlyTime(probeSpeed, system.distance);
    const fleetData: FleetData = {
      destinationSystemId: id,
      endTime: Date.now() + timeToExplore,
      movementType: "EXPLORE SYSTEM",
      origin: "PLANET",
      ships: [{ type: "PROBE", amount: 1 }],
      startTime: Date.now(),
      id: uuid.v4() as string,
    };

    await newFleet(fleetData);
    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, explorationStartedAt: Date.now(), explorationFleetId: fleetData.id }
          : s
      )
    );
  };

  const exploreStarSystem = async (
    id: string,
    currentFleet: FleetData[],
    currentSystems: StarSystem[]
  ): Promise<{ updatedFleet: FleetData[]; updatedSystems: StarSystem[] }> => {
    const system = currentSystems.find((s) => s.id === id);
    if (!system) return { updatedFleet: currentFleet, updatedSystems: currentSystems };

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
              origin: f.destinationSystemId,
              movementType: "RETURN",
            }
      );
    }

    return { updatedFleet, updatedSystems };
  };

  const explorePlanet = async (
    systemId: string,
    planetId: string,
    currentFleet: FleetData[],
    currentSystems: StarSystem[]
  ): Promise<{ updatedFleet: FleetData[]; updatedSystems: StarSystem[] }> => {
    const system = currentSystems.find((s) => s.id === systemId);
    if (!system) return { updatedFleet: currentFleet, updatedSystems: currentSystems };

    const planet = system.planets.find((p) => p.id === planetId);
    if (!planet) return { updatedFleet: currentFleet, updatedSystems: currentSystems };

    const updatedSystems = currentSystems.map((s) =>
      s.id === systemId
        ? {
            ...s,
            planets: s.planets.map((p) => (p.id === planetId ? { ...p, explored: true } : p)),
          }
        : s
    );

    let updatedFleet = [...currentFleet];

    // actualizar flota para que regrese
    updatedFleet = updatedFleet.map((f) =>
      f.id !== planet.explorationFleetId
        ? f
        : {
            ...f,
            startTime: Date.now(),
            endTime: Date.now() + (f.endTime - f.startTime),
            destinationSystemId: f.origin,
            origin: f.destinationSystemId,
            destinationPlanetId: undefined,
            movementType: "RETURN",
          }
    );

    return { updatedFleet, updatedSystems };
  };

  const startPlanetExploration = async (systemId: string, planetId: string) => {
    const system = starSystems.find((system) => system.id == systemId);
    if (!system) return;

    const planet = system.planets.find((planet) => planet.id == planetId);
    if (!planet) return;

    const probeSpeed = shipConfig["PROBE"].speed;
    const timeToExplore = getFlyTime(probeSpeed, system.distance);
    const fleetData: FleetData = {
      destinationSystemId: systemId,
      destinationPlanetId: planetId,
      endTime: Date.now() + timeToExplore,
      movementType: "EXPLORE PLANET",
      origin: "PLANET",
      ships: [{ type: "PROBE", amount: 1 }],
      startTime: Date.now(),
      id: uuid.v4() as string,
    };

    await newFleet(fleetData);
    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === systemId
          ? {
              ...s,
              planets: s.planets.map((p) =>
                p.id === planetId
                  ? {
                      ...p,
                      explorationStartedAt: Date.now(),
                      explorationFleetId: fleetData.id,
                    }
                  : p
              ),
            }
          : s
      )
    );
  };

  const cancelExploreSystem = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system || !system.explorationFleetId) return;

    const updatedFleet = await cancelFleet(system.explorationFleetId, fleet);

    await updateFleet(updatedFleet);
    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, explorationFleetId: undefined, explorationStartedAt: undefined } : s
      )
    );
  };

  const cancelExplorePlanet = async (systemId: string, planetId: string) => {
    const system = starSystems.find((s) => s.id === systemId);
    if (!system) return;

    const planet = system.planets.find((p) => p.id === planetId);
    if (!planet || !planet.explorationFleetId) return;

    const updatedFleet = await cancelFleet(planet.explorationFleetId, fleet);

    await updateFleet(updatedFleet);

    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === systemId
          ? {
              ...s,
              planets: s.planets.map((p) =>
                p.id === planetId
                  ? { ...p, explorationFleetId: undefined, explorationStartedAt: undefined }
                  : p
              ),
            }
          : s
      )
    );
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

  const resetFleet = async () => updateFleet([]);

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
    cancelExplorePlanet,
    resetStarSystem,
    discardStarSystem,
    startPlanetExploration,
    processFleeTick,
    newFleet,
    cancelFleet,
    resetFleet,
  };
};
