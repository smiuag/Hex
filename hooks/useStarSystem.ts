import { shipConfig } from "@/src/config/shipConfig";
import {
  SCAN_DURATION,
  STELAR_BUILDINGS_COST,
  STELAR_BUILDINGS_DURATION,
} from "@/src/constants/general";
import {
  deleteStarSystem,
  loadFleet,
  loadStarSystem,
  saveFleet,
  saveStarSystem,
} from "@/src/services/storage";
import { FleetData, MovementType } from "@/src/types/fleetType";
import { PlayerQuest, UpdateQuestOptions } from "@/src/types/questType";
import { Resources } from "@/src/types/resourceTypes";
import { Ship, ShipType } from "@/src/types/shipType";
import { StarSystem, StarSystemMap } from "@/src/types/starSystemTypes";
import { simulateBattle } from "@/utils/combat";
import { getFlyTime } from "@/utils/shipUtils";
import { generateSystem } from "@/utils/starSystemUtils";
import { useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";

export const useStarSystem = (
  playerQuests: PlayerQuest[],
  universe: StarSystemMap,
  handleDestroyShip: (type: ShipType, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipType; amount: number }[]) => void,
  subtractResources: (modifications: Partial<Resources>) => void,
  updateQuest: (options: UpdateQuestOptions) => void
) => {
  const [starSystems, setPlayerStarSystems] = useState<StarSystem[]>([]);
  const [fleet, setFleet] = useState<FleetData[]>([]);
  const systemsRef = useRef<StarSystem[]>([]);
  const fleetRef = useRef<FleetData[]>([]);

  const updateFleet = async (newFleet: FleetData[]) => {
    fleetRef.current = newFleet;
    setFleet(newFleet);
    await saveFleet(newFleet);
  };

  const updateSystems = async (newSystems: StarSystem[]) => {
    systemsRef.current = newSystems;
    setPlayerStarSystems(newSystems);
    await saveStarSystem(newSystems);
  };

  const loadFleetData = async () => {
    const saved = await loadFleet();
    if (saved) {
      fleetRef.current = saved;
      setFleet(saved);
    }
  };

  const loadStarSystems = async () => {
    const saved = await loadStarSystem();
    if (saved) {
      systemsRef.current = saved;
      setPlayerStarSystems(saved);
    }
  };

  const modifyFleet = async (modifier: (fleet: FleetData[]) => FleetData[]) => {
    await updateFleet(modifier(fleetRef.current));
  };

  const modifySystems = async (modifier: (systems: StarSystem[]) => StarSystem[]) => {
    await updateSystems(modifier(systemsRef.current));
  };

  useEffect(() => {
    loadStarSystems();
    loadFleetData();
  }, []);

  const newFleet = async (newFleet: FleetData) => {
    newFleet.ships.forEach((ship) => {
      handleDestroyShip(ship.type, ship.amount);
    });

    await modifyFleet((prevFleet) => [...prevFleet, newFleet]);
  };

  //La manda de vuelta
  const cancelFleet = async (id: string) => {
    const now = Date.now();

    await modifyFleet((fleet) =>
      fleet.map((f) => {
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
      })
    );
  };

  const destroyFleet = async (id: string) => {
    await modifyFleet((fleet) => fleet.filter((f) => f.id !== id));
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

  const attackResolution = async (fleetId: string) => {
    const attackingFleetData = fleetRef.current.find((f) => f.id === fleetId);
    if (!attackingFleetData) return;

    const targetSystem = systemsRef.current.find(
      (sys) => sys.id === attackingFleetData.destinationSystemId
    );
    if (!targetSystem) return;

    // Actualiza el sistema como no atacado
    await modifySystems((sys) =>
      sys.map((sys) =>
        sys.id === targetSystem.id
          ? { ...sys, attackStartedAt: undefined, attackFleetId: undefined }
          : sys
      )
    );

    // Simula la batalla
    const battleResult = simulateBattle(attackingFleetData.ships, targetSystem.defense);

    // Flotas restantes ya en formato Ship[]
    const updatedAttackingFleetShips = battleResult.remaining.fleetA;
    const updatedDefenseShips = battleResult.remaining.fleetB;

    // Actualiza la defensa del sistema usando updatedSystems (no currentSystems)
    modifySystems((systems) =>
      systems.map((system) =>
        system.id === targetSystem.id ? { ...system, defense: updatedDefenseShips } : system
      )
    );

    // Actualiza la flota atacante: si no quedan naves la elimina, si quedan actualiza
    await modifyFleet((fleet) => fleet.filter((f) => f.id !== fleetId));

    if (updatedAttackingFleetShips.length > 0) {
      if (battleResult.winner === "A") {
        // Ganaron los atacantes: flota regresa y sistema queda sin defensa ni ataque en curso
        await modifyFleet((fleet) => {
          const now = Date.now();
          const updated = [...fleet]; // Copia defensiva
          const index = updated.findIndex((f) => f.id === attackingFleetData.id);

          if (index !== -1) {
            const timeSpent = attackingFleetData.endTime - attackingFleetData.startTime;

            updated[index] = {
              ...attackingFleetData,
              ships: updatedAttackingFleetShips,
              startTime: now,
              endTime: now + timeSpent,
              destinationSystemId: attackingFleetData.origin,
              origin: attackingFleetData.destinationSystemId,
              movementType: "RETURN",
            };
          }

          return updated;
        });

        await modifySystems((systems) =>
          systems.map((sys) =>
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
          )
        );
      } else {
        // Perdieron los atacantes: flota eliminada, sistema con defensa actualizada
        // Ya filtramos la flota atacante arriba, nada más que hacer aquí
      }
    }
  };

  const processFleeTick = async () => {
    const now = Date.now();
    let changed = false;

    const shipsToCreateMap: Partial<Record<ShipType, number>> = {};

    for (let i = fleetRef.current.length - 1; i >= 0; i--) {
      const f = fleetRef.current[i];
      if (f.endTime > now) continue;
      changed = true;

      switch (f.movementType) {
        case "RETURN":
          handleCreateShips(f.ships);
          destroyFleet(f.id);
          break;

        case "EXPLORE SYSTEM":
          await exploreStarSystem(f.destinationSystemId, f.id);
          break;

        case "EXPLORE PLANET":
          await explorePlanet(f.destinationSystemId, f.destinationPlanetId!, f.id);
          break;

        case "ATTACK":
          await attackResolution(f.id);
          break;

        default:
          console.warn(`Unhandled movement type: ${f.movementType}`);
      }
    }

    const shipsToCreate = Object.entries(shipsToCreateMap).map(([type, amount]) => ({
      type: type as ShipType,
      amount,
    }));
  };

  const discardStarSystem = async (id: string) => {
    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, discarded: true } : s))
    );
  };

  const startStarSystemExploration = async (id: string) => {
    const system = systemsRef.current.find((system) => system.id === id);
    if (!system || system.explorationFleetId) return;

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

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id
          ? { ...s, explorationStartedAt: Date.now(), explorationFleetId: fleetData.id }
          : s
      )
    );
  };

  const exploreStarSystem = async (systemId: string, fleetId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);

    if (!system) {
      await cancelFleet(fleetId);
      return;
    }

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId
          ? {
              ...s,
              explored: true,
              explorationFleetId: undefined,
              conquered: s.defense.length === 0,
            }
          : s
      )
    );

    if (system.defense.length > 0) {
      await modifyFleet((fleet) => fleet.filter((f) => f.id !== fleetId));
    } else {
      await cancelFleet(fleetId!);
    }

    if (!playerQuests.some((pq) => pq.type == "EXPLORE_SYSTEM" && pq.completed))
      await updateQuest({ type: "EXPLORE_SYSTEM", completed: true });
  };

  const stelarPortBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, starPortStartedAt: undefined, starPort: true } : s))
    );
  };

  const extractionBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, extractionStartedAt: undefined, extractionBuildingBuilt: true } : s
      )
    );
  };

  const defenseBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, defenseStartedAt: undefined, defenseBuildingBuilt: true } : s
      )
    );
  };

  const scanFinished = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, scanStartedAt: undefined } : s))
    );

    if (!playerQuests.some((pq) => pq.type == "SCAN_FIRST" && pq.completed))
      await updateQuest({ type: "SCAN_FIRST", completed: true });
  };

  const stelarPortStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STELAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, starPortStartedAt: Date.now() } : s))
    );
  };

  const extractionStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STELAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, extractionStartedAt: Date.now() } : s))
    );
  };

  const defenseStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STELAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, defenseStartedAt: Date.now() } : s))
    );
  };

  const explorePlanet = async (systemId: string, planetId: string, fleetId: string) => {
    await cancelFleet(fleetId);

    const system = systemsRef.current.find((s) => s.id === systemId);
    if (!system) return;

    const planet = system.planets.find((p) => p.id === planetId);
    if (!planet) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId
          ? {
              ...s,
              planets: s.planets.map((p) => (p.id === planetId ? { ...p, explored: true } : p)),
            }
          : s
      )
    );
  };

  const startPlanetExploration = async (systemId: string, planetId: string) => {
    const system = systemsRef.current.find((system) => system.id === systemId);
    if (!system) return;

    const planet = system.planets.find((planet) => planet.id === planetId);
    if (!planet || planet.explorationFleetId) return;

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

    await modifySystems((systems) =>
      systems.map((s) =>
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
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system || !system.explorationFleetId) return;

    await cancelFleet(system.explorationFleetId);

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, explorationFleetId: undefined, explorationStartedAt: undefined } : s
      )
    );
  };

  const cancelExplorePlanet = async (systemId: string, planetId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (!system) return;

    const planet = system.planets.find((p) => p.id === planetId);
    if (!planet || !planet.explorationFleetId) return;

    await cancelFleet(planet.explorationFleetId);

    await modifySystems((systems) =>
      systems.map((s) =>
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
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system || !system.attackFleetId) return;

    await cancelFleet(system.attackFleetId);

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, attackFleetId: undefined, attackStartedAt: undefined } : s
      )
    );
  };

  const startAttack = async (systemId: string, fleet: Ship[]) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
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

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId ? { ...s, attackStartedAt: Date.now(), attackFleetId: fleetData.id } : s
      )
    );
  };

  const scanStarSystem = async (currentSystemId: string, id: string) => {
    const starSystem = universe[id];
    const generated: StarSystem = {
      ...generateSystem(currentSystemId, starSystem),
      scanStartedAt: Date.now(),
    };

    await modifySystems((systems) => [...systems, generated]);
  };

  const recoverStarSystem = async (id: string) => {
    const system = systemsRef.current.find((system) => system.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, discarded: false } : s))
    );
  };

  const cancelScanStarSystem = async (id: string) => {
    await modifySystems((systems) => systems.filter((s) => s.id !== id));
  };

  const resetFleet = async () => await modifyFleet((fleet) => []);

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
