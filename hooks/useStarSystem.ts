import { shipConfig } from "@/src/config/shipConfig";
import { FleetData, MovementType } from "@/src/types/fleetType";
import { Ship, ShipType } from "@/src/types/shipType";
import { simulateBattle } from "@/utils/combat";
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
import { Resources } from "../src/types/resourceTypes";
import { StarSystem } from "../src/types/starSystemTypes";
import { getBuildCost } from "../utils/buildingUtils";
import { generateInitialSystems } from "../utils/starSystemUtils";

export const useStarSystem = (
  handleDestroyShip: (type: ShipType, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipType; amount: number }[]) => void,
  subtractResources: (modifications: Partial<Resources>) => void
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

  const processColonialBuildings = async () => {
    const now = Date.now();
    for (let i = 0; i < starSystems.length; i++) {
      const startTime = starSystems[i].starPortStartedAt;

      if (startTime && now - startTime > 1000 * 60 * 60 * 24) {
        stelarPortBuild(starSystems[i].id);
      }
    }
  };

  const attackResolution = async (
    fleetId: string,
    currentFleet: FleetData[],
    currentSystems: StarSystem[]
  ): Promise<{ updatedFleet: FleetData[]; updatedSystems: StarSystem[] }> => {
    const attackingFleetData = currentFleet.find((f) => f.id === fleetId);
    if (!attackingFleetData) {
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }

    const targetSystem = currentSystems.find(
      (sys) => sys.id === attackingFleetData.destinationSystemId
    );
    if (!targetSystem) {
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }

    // Simula la batalla
    const battleResult = simulateBattle(attackingFleetData.ships, targetSystem.defense);

    // Flotas restantes ya en formato Ship[]
    const updatedAttackingFleetShips = battleResult.remaining.fleetA;
    const updatedDefenseShips = battleResult.remaining.fleetB;

    // Actualiza la defensa del sistema
    let updatedSystems = currentSystems.map((sys) =>
      sys.id === targetSystem.id ? { ...sys, defense: updatedDefenseShips } : sys
    );

    // Actualiza la flota atacante: si no quedan naves la elimina, si quedan actualiza
    let updatedFleet = currentFleet.filter((f) => f.id !== fleetId);

    if (updatedAttackingFleetShips.length > 0) {
      if (battleResult.winner === "A") {
        // Ganaron los atacantes: flota regresa y sistema queda sin defensa ni ataque en curso
        updatedFleet.push({
          ...attackingFleetData,
          ships: updatedAttackingFleetShips,
          startTime: Date.now(),
          endTime: Date.now() + (attackingFleetData.endTime - attackingFleetData.startTime),
          destinationSystemId: attackingFleetData.origin,
          origin: attackingFleetData.destinationSystemId,
          movementType: "RETURN",
        });

        updatedSystems = updatedSystems.map((sys) =>
          sys.id === targetSystem.id
            ? {
                ...sys,
                defense: [],
                attackFleetId: undefined,
                attackStartedAt: undefined,
                defended: false,
              }
            : sys
        );
      } else {
        // Perdieron los atacantes: flota eliminada, sistema con defensa actualizada
        // Ya filtramos la flota atacante arriba, nada más que hacer aquí
      }
    }

    return {
      updatedFleet,
      updatedSystems,
    };
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

        case "ATTACK":
          result = await attackResolution(f.id, workingFleet, workingSystems);
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

  const stelarPortBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, starPortStartedAt: undefined, starPort: true } : s))
    );
  };

  const stelarPorStarttBuild = async (id: string) => {
    const cost = getBuildCost("SPACESTATION", 1);
    await subtractResources(cost);
    await handleDestroyShip("FREIGHTER", 2);

    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, starPortStartedAt: Date.now() } : s))
    );
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

    if (saved) {
      let allSystems = saved;

      if (saved.length < 3) {
        const generated = generateInitialSystems(3 - saved.length);
        allSystems = [...saved, ...generated];
        await saveStarSystem(allSystems); // guardamos todos
      }

      setPlayerStarSystems(allSystems); // ahora seteamos todos, no solo los nuevos
    }
  };

  const cancelAttack = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system || !system.attackFleetId) return;

    const updatedFleet = await cancelFleet(system.attackFleetId, fleet);

    await updateFleet(updatedFleet);
    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, attackFleetId: undefined, attackStartedAt: undefined } : s
      )
    );
  };

  const startAttack = async (systemId: string, fleet: Ship[]) => {
    const system = starSystems.find((system) => system.id == systemId);
    if (!system) return;

    const slowestSpeed = Math.min(...fleet.map((f) => shipConfig[f.type].speed));
    const timeToExplore = getFlyTime(slowestSpeed, system.distance);
    const fleetData: FleetData = {
      destinationSystemId: systemId,
      endTime: Date.now() + timeToExplore,
      movementType: "ATTACK",
      origin: "PLANET",
      ships: fleet,
      startTime: Date.now(),
      id: uuid.v4() as string,
    };

    await newFleet(fleetData);
    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === systemId ? { ...s, attackStartedAt: Date.now(), attackFleetId: fleetData.id } : s
      )
    );
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
    processColonialBuildings,
    newFleet,
    cancelFleet,
    resetFleet,
    stelarPorStarttBuild,
    startAttack,
    cancelAttack,
  };
};
