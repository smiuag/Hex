import { shipConfig } from "@/src/config/shipConfig";
import { SCAN_DURATION, STELAR_BUILDINGS_DURATION } from "@/src/constants/general";
import {
  deleteStarSystem,
  loadFleet,
  loadStarSystem,
  saveFleet,
  saveStarSystem,
} from "@/src/services/storage";
import { FleetData, MovementType } from "@/src/types/fleetType";
import { Resources } from "@/src/types/resourceTypes";
import { Ship, ShipType } from "@/src/types/shipType";
import { StarSystem, StarSystemMap } from "@/src/types/starSystemTypes";
import { simulateBattle } from "@/utils/combat";
import { getFlyTime } from "@/utils/shipUtils";
import { generateSystem } from "@/utils/starSystemUtils";
import { useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import { getBuildCost } from "../utils/buildingUtils";

export const useStarSystem = (
  universe: StarSystemMap,
  handleDestroyShip: (type: ShipType, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipType; amount: number }[]) => void,
  subtractResources: (modifications: Partial<Resources>) => void
) => {
  const [starSystems, setPlayerStarSystems] = useState<StarSystem[]>([]);
  const [fleet, setFleet] = useState<FleetData[]>([]);
  const systemsRef = useRef<StarSystem[]>([]);
  const fleetRef = useRef<FleetData[]>([]);

  const updateFleet = async (updater: FleetData[] | ((prev: FleetData[]) => FleetData[])) => {
    setFleet((prev) => {
      const next = typeof updater === "function" ? updater(fleetRef.current) : updater;
      fleetRef.current = next;
      saveFleet(next);
      return next;
    });
  };

  const updateSystems = async (updater: StarSystem[] | ((prev: StarSystem[]) => StarSystem[])) => {
    setPlayerStarSystems((prev) => {
      const next = typeof updater === "function" ? updater(systemsRef.current) : updater;
      systemsRef.current = next;
      saveStarSystem(next);
      return next;
    });
  };

  const loadFleetData = async () => {
    const saved = await loadFleet();
    if (saved) {
      setFleet(saved);
      fleetRef.current = saved;
    }
  };

  const loadStarSystems = async () => {
    const saved = await loadStarSystem();
    if (saved) {
      setPlayerStarSystems(saved);
      systemsRef.current = saved;
    }
  };

  const scanStarSystem = async (currentSystemId: string, id: string) => {
    const starSystem = universe[id];
    const generated = {
      ...generateSystem(currentSystemId, starSystem),
      scanStartedAt: Date.now(),
    };

    await updateSystems((prev) => [...prev, generated]);
  };

  const cancelScanStarSystem = async (id: string) => {
    const system = starSystems.find((system) => system.id == id);
    if (!system) return;

    await updateSystems((prev) => prev.filter((s) => s.id !== id));
  };

  const recoverStarSystem = async (id: string) => {
    const system = starSystems.find((system) => system.id == id);
    if (!system) return;

    await updateSystems((prev) => prev.map((s) => (s.id === id ? { ...s, discarded: false } : s)));
  };

  useEffect(() => {
    loadStarSystems();
    loadFleetData();
  }, []);

  const newFleet = async (newFleet: FleetData) => {
    newFleet.ships.forEach((ship) => {
      handleDestroyShip(ship.type, ship.amount);
    });

    await updateFleet((prev) => [...prev, newFleet]);
  };

  //La manda de vuelta
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

  const processColonialTick = async () => {
    const now = Date.now();
    for (let i = 0; i < starSystems.length; i++) {
      const starPortStartTime = starSystems[i].starPortStartedAt;
      const scanStartTime = starSystems[i].scanStartedAt;
      const extractionStartTime = starSystems[i].extractionStartedAt;
      const defenseStartTime = starSystems[i].defenseStartedAt;

      if (starPortStartTime && now - starPortStartTime > STELAR_BUILDINGS_DURATION) {
        stelarPortBuild(starSystems[i].id);
      }

      if (extractionStartTime && now - extractionStartTime > STELAR_BUILDINGS_DURATION) {
        extractionBuild(starSystems[i].id);
      }

      if (defenseStartTime && now - defenseStartTime > STELAR_BUILDINGS_DURATION) {
        defenseBuild(starSystems[i].id);
      }

      if (scanStartTime && now - scanStartTime > SCAN_DURATION) {
        scanFinished(starSystems[i].id);
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
      currentFleet = await cancelFleet(fleetId, currentFleet);
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }

    // Actualiza el sistema como no atacado
    let updatedSystems = currentSystems.map((sys) =>
      sys.id === targetSystem.id
        ? { ...sys, attackStartedAt: undefined, attackFleetId: undefined }
        : sys
    );

    // Simula la batalla
    const battleResult = simulateBattle(attackingFleetData.ships, targetSystem.defense);

    // Flotas restantes ya en formato Ship[]
    const updatedAttackingFleetShips = battleResult.remaining.fleetA;
    const updatedDefenseShips = battleResult.remaining.fleetB;

    // Actualiza la defensa del sistema usando updatedSystems (no currentSystems)
    updatedSystems = updatedSystems.map((sys) =>
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
                starPortStartedAt: undefined,
                defended: false,
                conquered: true,
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
          result = await exploreStarSystem(
            f.destinationSystemId,
            workingFleet,
            workingSystems,
            f.id
          );
          workingFleet = result.updatedFleet;
          workingSystems = result.updatedSystems;
          break;

        case "EXPLORE PLANET":
          result = await explorePlanet(
            f.destinationSystemId,
            f.destinationPlanetId!,
            workingFleet,
            workingSystems,
            f.id
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
    const system = starSystems.find((system) => system.id == id);
    if (!system) return;

    await updateSystems((prev) => prev.map((s) => (s.id === id ? { ...s, discarded: true } : s)));
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
    currentSystems: StarSystem[],
    fleetId: string
  ): Promise<{ updatedFleet: FleetData[]; updatedSystems: StarSystem[] }> => {
    const system = currentSystems.find((s) => s.id === id);
    if (!system) {
      currentFleet = await cancelFleet(fleetId, currentFleet);
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }
    const updatedSystems = currentSystems.map((s) =>
      s.id === id ? { ...s, explored: true, conquered: s.defense.length === 0 } : s
    );

    let updatedFleet = [...currentFleet];

    if (system.defense.length > 0) {
      updatedFleet = updatedFleet.filter((f) => f.id !== system.explorationFleetId);
    } else {
      updatedFleet = await cancelFleet(system.explorationFleetId!, currentFleet);
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

  const extractionBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, extractionStartedAt: undefined, extractionBuildingBuilt: true } : s
      )
    );
  };

  const defenseBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    await updateSystems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, defenseStartedAt: undefined, defenseBuildingBuilt: true } : s
      )
    );
  };

  const scanFinished = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, scanStartedAt: undefined } : s))
    );
  };

  const stelarPortStartBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    const cost = getBuildCost("SPACESTATION", 1);
    await subtractResources(cost);
    await handleDestroyShip("FREIGHTER", 2);

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, starPortStartedAt: Date.now() } : s))
    );
  };

  const extractionStartBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    const cost = getBuildCost("SPACESTATION", 1);
    await subtractResources(cost);
    await handleDestroyShip("FREIGHTER", 2);

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, extractionStartedAt: Date.now() } : s))
    );
  };

  const defenseStartBuild = async (id: string) => {
    const system = starSystems.find((s) => s.id === id);
    if (!system) return;

    const cost = getBuildCost("SPACESTATION", 1);
    await subtractResources(cost);
    await handleDestroyShip("FREIGHTER", 2);

    await updateSystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, defenseStartedAt: Date.now() } : s))
    );
  };

  const explorePlanet = async (
    systemId: string,
    planetId: string,
    currentFleet: FleetData[],
    currentSystems: StarSystem[],
    fleetId: string
  ): Promise<{ updatedFleet: FleetData[]; updatedSystems: StarSystem[] }> => {
    const system = currentSystems.find((s) => s.id === systemId);
    if (!system) {
      currentFleet = await cancelFleet(fleetId, currentFleet);
      return {
        updatedFleet: currentFleet,
        updatedSystems: currentSystems,
      };
    }
    const planet = system.planets.find((p) => p.id === planetId);
    if (!planet) {
      currentFleet = await cancelFleet(fleetId, currentFleet);
      return { updatedFleet: currentFleet, updatedSystems: currentSystems };
    }
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
    processColonialTick,
    newFleet,
    cancelFleet,
    resetFleet,
    stelarPortStartBuild,
    extractionStartBuild,
    defenseStartBuild,
    startAttack,
    cancelAttack,
    loadStarSystems,
    scanStarSystem,
    recoverStarSystem,
    cancelScanStarSystem,
  };
};
