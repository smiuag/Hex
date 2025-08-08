import { shipConfig } from "@/src/config/shipConfig";
import {
  SCAN_DURATION,
  STAR_BUILDINGS_COST,
  STAR_BUILDINGS_DURATION,
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
import { CombinedResources, Resources } from "@/src/types/resourceTypes";
import { Ship, ShipType } from "@/src/types/shipType";
import { StarSystem, StarSystemMap } from "@/src/types/starSystemTypes";
import { simulateBattle } from "@/utils/combat";
import { getAccumulatedResources, sumCombinedResources } from "@/utils/resourceUtils";
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
  addResources: (modifications: Partial<Resources>) => void,
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
    if (Array.isArray(saved)) {
      fleetRef.current = saved;
      setFleet(saved);
    } else {
      console.warn("⚠️ loadFleet devolvió datos inválidos:", saved);
      fleetRef.current = [];
      setFleet([]);
    }
  };

  const loadStarSystems = async () => {
    const saved = await loadStarSystem();
    if (Array.isArray(saved)) {
      systemsRef.current = saved;
      setPlayerStarSystems(saved);
    } else {
      console.warn("⚠️ loadStarSystem devolvió datos inválidos:", saved);
      systemsRef.current = [];
      setPlayerStarSystems([]);
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
  const cancelFleet = async (fleetId: string, resources?: CombinedResources) => {
    const now = Date.now();

    await modifyFleet((fleet) =>
      fleet.map((f) => {
        if (f.id !== fleetId) return f;

        const D = Math.max(0, f.endTime - f.startTime); // duración total de la ida
        const hasArrivedToDestination = now >= f.endTime;

        // 1) Todavía iba de ida: cancelo y vuelvo
        if (!hasArrivedToDestination) {
          const elapsed = Math.max(0, now - f.startTime);
          const returnDuration = elapsed;
          const returnEnd = now + returnDuration;

          return {
            ...f,
            startTime: now,
            endTime: returnEnd,
            origin: f.destinationSystemId,
            destinationSystemId: f.origin,
            destinationPlanetId: undefined,
            movementType: "RETURN" as MovementType,
            resources: resources ?? {},
          };
        }

        // 2) Ya llegó al destino: el retorno empieza en la hora real de llegada
        const returnStart = f.endTime;
        const returnDuration = D;
        const returnEnd = returnStart + returnDuration;

        return {
          ...f,
          startTime: returnStart,
          endTime: returnEnd,
          origin: f.destinationSystemId,
          destinationSystemId: f.origin,
          destinationPlanetId: undefined,
          movementType: "RETURN" as MovementType,
          resources: resources ?? {},
        };
      })
    );
  };

  const destroyFleet = async (fleetId: string) => {
    const currentFleet = fleetRef.current.find((f) => f.id == fleetId);
    if (!currentFleet) return;
    if (
      Object.keys(currentFleet.resources).length > 0 &&
      currentFleet.destinationSystemId == "PLANET"
    ) {
      await addResources(currentFleet.resources);
      await updateQuest({ type: "COLLECT", completed: true });
    }
    await modifyFleet((fleet) => fleet.filter((f) => f.id !== fleetId));
  };

  const processColonialTick = async () => {
    const now = Date.now();
    if (!Array.isArray(starSystems)) return;

    for (let i = 0; i < starSystems.length; i++) {
      const starPortStartTime = starSystems[i].starPortStartedAt;
      const scanStartTime = starSystems[i].scanStartedAt;
      const extractionStartTime = starSystems[i].extractionStartedAt;
      const defenseStartTime = starSystems[i].defenseStartedAt;

      if (starPortStartTime && now - starPortStartTime > STAR_BUILDINGS_DURATION) {
        starPortBuild(starSystems[i].id);
      }

      if (extractionStartTime && now - extractionStartTime > STAR_BUILDINGS_DURATION) {
        extractionBuild(starSystems[i].id);
      }

      if (defenseStartTime && now - defenseStartTime > STAR_BUILDINGS_DURATION) {
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
      sys.map((sys) => (sys.id === targetSystem.id ? { ...sys, attackStartedAt: undefined } : sys))
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

    if (!Array.isArray(fleetRef.current)) return;
    for (let i = fleetRef.current.length - 1; i >= 0; i--) {
      const f = fleetRef.current[i];
      if (f.endTime > now) continue;

      switch (f.movementType) {
        case "EXPLORE SYSTEM":
          await exploreStarSystem(f.destinationSystemId, f.id);
          break;

        case "EXPLORE CELESTIALBODY":
          await exploreCelestialBody(f.destinationSystemId, f.destinationPlanetId!, f.id);
          break;

        case "ATTACK":
          await attackResolution(f.id);
          break;

        case "COLLECT":
          await collectSystem(f.id);
          break;

        case "RETURN":
          handleCreateShips(f.ships);
          destroyFleet(f.id);
          break;

        default:
          console.warn(`Unhandled movement type: ${f.movementType}`);
      }
    }
  };

  const discardStarSystem = async (id: string) => {
    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, discarded: true } : s))
    );
  };

  const startStarSystemExploration = async (id: string) => {
    const system = systemsRef.current.find((system) => system.id === id);
    if (!system || system.explorationStartedAt) return;

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
      resources: {},
    };

    await newFleet(fleetData);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, explorationStartedAt: Date.now() } : s))
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
              explorationStartedAt: undefined,
              conquered: !s.defense || s.defense.length === 0,
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

  const starPortBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, starPortStartedAt: undefined, starPortBuilt: true } : s
      )
    );

    if (!playerQuests.some((pq) => pq.type == "SYSTEM_BUILT_STARPORT" && pq.completed))
      await updateQuest({ type: "SYSTEM_BUILT_STARPORT", completed: true });
  };

  const extractionBuild = async (id: string) => {
    await modifySystems((systems) => {
      const now = Date.now();

      return systems.map((s) => {
        if (s.id !== id) return s;

        const started = s.extractionStartedAt ?? now;
        const finishedAt = started + STAR_BUILDINGS_DURATION;
        const effectiveAt = Math.min(finishedAt, now);
        const resAtFinish = getAccumulatedResources(s.storedResources, effectiveAt);

        return {
          ...s,
          extractionStartedAt: undefined,
          extractionBuildingBuilt: true,
          storedResources: {
            ...s.storedResources,
            resources: resAtFinish,
            production: s.storedResources.production,
            lastUpdate: effectiveAt,
          },
        };
      });
    });

    if (!playerQuests.some((pq) => pq.type === "SYSTEM_BUILT_EXTRACTION" && pq.completed)) {
      await updateQuest({ type: "SYSTEM_BUILT_EXTRACTION", completed: true });
    }
  };

  const defenseBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === id ? { ...s, defenseStartedAt: undefined, defenseBuildingBuilt: true } : s
      )
    );

    if (!playerQuests.some((pq) => pq.type == "SYSTEM_BUILT_DEFENSE" && pq.completed))
      await updateQuest({ type: "SYSTEM_BUILT_DEFENSE", completed: true });
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

  const starPortStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, starPortStartedAt: Date.now() } : s))
    );
  };

  const extractionStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, extractionStartedAt: Date.now() } : s))
    );
  };

  const defenseStartBuild = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await subtractResources(STAR_BUILDINGS_COST);
    await handleDestroyShip("FREIGHTER", 2);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, defenseStartedAt: Date.now() } : s))
    );
  };

  const collectSystem = async (fleetId: string) => {
    const fleet = fleetRef.current.find((f) => f.id == fleetId);
    if (!fleet) return;

    const system = systemsRef.current.find((s) => s.id === fleet.destinationSystemId);

    const resources = system?.storedResources.resources
      ? getAccumulatedResources(system?.storedResources)
      : {};

    cancelFleet(fleet.id, resources);

    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === system.id
          ? {
              ...s,
              collectStartedAt: undefined,
              storedResources: {
                lastUpdate: Date.now(),
                production: s.storedResources.production,
                resources: {},
              },
            }
          : s
      )
    );
  };

  const startCollectSystem = async (systemId: string) => {
    const system = systemsRef.current.find((system) => system.id === systemId);
    if (!system) return;

    const freighterSpeed = shipConfig["FREIGHTER"].speed;
    const timeToCollect = getFlyTime(freighterSpeed, system.distance);

    const fleetData: FleetData = {
      destinationSystemId: systemId,
      endTime: Date.now() + timeToCollect,
      movementType: "COLLECT",
      origin: "PLANET",
      ships: [{ type: "FREIGHTER", amount: 1 }],
      startTime: Date.now(),
      id: uuid.v4() as string,
      resources: {},
    };

    await newFleet(fleetData);

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId
          ? {
              ...s,
              collectStartedAt: Date.now(),
            }
          : s
      )
    );
  };

  const exploreCelestialBody = async (
    systemId: string,
    celestialBodyId: string,
    fleetId: string
  ) => {
    await cancelFleet(fleetId);

    const system = systemsRef.current.find((s) => s.id === systemId);
    if (!system) return;

    const planet = system.celestialBodies.find((p) => p.id === celestialBodyId);
    if (!planet) return;

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId
          ? {
              ...s,
              storedResources: {
                lastUpdate: Date.now(),
                production: sumCombinedResources(s.storedResources.production, planet.production),
                resources: s.storedResources.resources,
              },
              celestialBodies: s.celestialBodies.map((p) =>
                p.id === celestialBodyId ? { ...p, explored: true } : p
              ),
            }
          : s
      )
    );
  };

  const startCelestialBodyExploration = async (systemId: string, celestialBodyId: string) => {
    const system = systemsRef.current.find((system) => system.id === systemId);
    if (!system) return;

    const celestialBody = system.celestialBodies.find((cb) => cb.id === celestialBodyId);
    if (!celestialBody || celestialBody.explorationStartedAt) return;

    const probeSpeed = shipConfig["PROBE"].speed;
    const timeToExplore = getFlyTime(probeSpeed, system.distance);

    const fleetData: FleetData = {
      destinationSystemId: systemId,
      destinationPlanetId: celestialBodyId,
      endTime: Date.now() + timeToExplore,
      movementType: "EXPLORE CELESTIALBODY",
      origin: "PLANET",
      ships: [{ type: "PROBE", amount: 1 }],
      startTime: Date.now(),
      id: uuid.v4() as string,
      resources: {},
    };

    await newFleet(fleetData);

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === systemId
          ? {
              ...s,
              celestialBodies: s.celestialBodies.map((p) =>
                p.id === celestialBodyId
                  ? {
                      ...p,
                      explorationStartedAt: Date.now(),
                    }
                  : p
              ),
            }
          : s
      )
    );
  };

  const cancelExploreSystem = async (systemId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (system)
      await modifySystems((systems) =>
        systems.map((s) => (s.id === systemId ? { ...s, explorationStartedAt: undefined } : s))
      );

    const fleet = fleetRef.current.find(
      (f) => f.destinationSystemId == systemId && f.movementType == "EXPLORE SYSTEM"
    );

    if (fleet) await cancelFleet(fleet.id);
  };

  const cancelCollect = async (systemId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (system)
      await modifySystems((systems) =>
        systems.map((s) => (s.id === systemId ? { ...s, collectStartedAt: undefined } : s))
      );

    const fleet = fleetRef.current.find(
      (f) => f.destinationSystemId == systemId && f.movementType == "COLLECT"
    );

    if (fleet) await cancelFleet(fleet.id);
  };

  const cancelExplorePlanet = async (systemId: string, planetId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (system) {
      const planet = system.celestialBodies.find((p) => p.id === planetId);
      if (planet)
        await modifySystems((systems) =>
          systems.map((s) =>
            s.id === systemId
              ? {
                  ...s,
                  celestialBodies: s.celestialBodies.map((p) =>
                    p.id === planetId ? { ...p, explorationStartedAt: undefined } : p
                  ),
                }
              : s
          )
        );
    }
    const fleet = fleetRef.current.find((f) => f.destinationPlanetId == planetId);
    if (fleet) await cancelFleet(fleet.id);
  };

  const cancelAttack = async (sistemId: string) => {
    const system = systemsRef.current.find((s) => s.id === sistemId);
    if (!system) return;

    const fleet = fleetRef.current.find(
      (f) => f.destinationSystemId == sistemId && f.movementType == "ATTACK"
    );
    if (!fleet) return;

    await cancelFleet(fleet.id);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === sistemId ? { ...s, attackStartedAt: undefined } : s))
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
      resources: {},
    };

    await newFleet(fleetData);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === systemId ? { ...s, attackStartedAt: Date.now() } : s))
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
    systemsRef.current = [];
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
    startCelestialBodyExploration,
    processFleeTick,
    processColonialTick,
    newFleet,
    cancelFleet,
    resetFleet,
    starPortStartBuild,
    extractionStartBuild,
    defenseStartBuild,
    startAttack,
    cancelAttack,
    loadStarSystems,
    scanStarSystem,
    recoverStarSystem,
    cancelScanStarSystem,
    startCollectSystem,
    cancelCollect,
  };
};
