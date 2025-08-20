import { shipConfig } from "@/src/config/shipConfig";
import {
  SCAN_DURATION,
  STAR_BUILDINGS_COST,
  STAR_BUILDINGS_DURATION,
} from "@/src/constants/general";
import { insertCombatResult } from "@/src/services/combatStorage";
import {
  deleteStarSystem,
  loadFleet,
  loadStarSystem,
  saveFleet,
  saveStarSystem,
} from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { FleetData, MovementType } from "@/src/types/fleetType";
import { PlayerQuest, UpdateQuestOptions } from "@/src/types/questType";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";
import { CombinedResources } from "@/src/types/resourceTypes";
import { Ship, ShipId, ShipSpecsCtx } from "@/src/types/shipType";
import { StarSystem, StarSystemMap } from "@/src/types/starSystemTypes";
import { simulateBattle } from "@/utils/combatUtils";
import { getHostileRace } from "@/utils/eventUtil";
import { getAccumulatedResources, sumCombinedResources } from "@/utils/resourceUtils";
import { getDistance, getFlyTime, getSpecByType, makeShip, sumFleet } from "@/utils/shipUtils";
import { generateSystem } from "@/utils/starSystemUtils";
import { useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";

export const useStarSystem = (
  playerQuests: PlayerQuest[],
  universe: StarSystemMap,
  specs: ShipSpecsCtx,
  playerDiplomacy: DiplomacyLevel[],
  checkNewRace: (race: RaceType) => void,
  handleDestroyShip: (type: ShipId, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipId; amount: number }[]) => void,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  addResources: (modifications: Partial<CombinedResources>) => void,
  updateQuest: (options: UpdateQuestOptions) => void,
  handleModifyDiplomacy: (race: RaceType, change: number) => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [starSystems, setPlayerStarSystems] = useState<StarSystem[]>([]);
  const [fleet, setFleet] = useState<FleetData[]>([]);
  const systemsRef = useRef<StarSystem[]>([]);
  const fleetRef = useRef<FleetData[]>([]);

  // Colas de persistencia (serializan escrituras) + flags de hidratación
  const systemsSaveChain = useRef(Promise.resolve());
  const fleetSaveChain = useRef(Promise.resolve());
  const systemsHydrated = useRef(false);
  const fleetHydrated = useRef(false);

  // Persistencia en serie: sistemas
  useEffect(() => {
    if (!systemsHydrated.current) {
      systemsHydrated.current = true;
      return;
    }
    const snapshot = systemsRef.current;
    systemsSaveChain.current = systemsSaveChain.current
      .then(() => saveStarSystem(snapshot))
      .catch((e) => console.error("Error saving star systems:", e));
  }, [starSystems]);

  // Persistencia en serie: flota
  useEffect(() => {
    if (!fleetHydrated.current) {
      fleetHydrated.current = true;
      return;
    }
    const snapshot = fleetRef.current;
    fleetSaveChain.current = fleetSaveChain.current
      .then(() => saveFleet(snapshot))
      .catch((e) => console.error("Error saving fleet:", e));
  }, [fleet]);

  // Carga inicial
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

  useEffect(() => {
    loadStarSystems();
    loadFleetData();
  }, []);

  // Modificadores seguros (functional set) que mantienen los refs sincronizados
  const modifyFleet = async (modifier: (fleet: FleetData[]) => FleetData[]) => {
    setFleet((prev) => {
      const next = modifier(prev);
      fleetRef.current = next;
      return next;
    });
  };

  const modifySystems = async (modifier: (systems: StarSystem[]) => StarSystem[]) => {
    setPlayerStarSystems((prev) => {
      const next = modifier(prev);
      systemsRef.current = next;
      return next;
    });
  };

  const newFleet = async (newFleet: FleetData) => {
    newFleet.ships.forEach((ship) => {
      handleDestroyShip(ship.type, ship.amount);
    });

    await modifyFleet((prevFleet) => [...prevFleet, newFleet]);
  };

  // La manda de vuelta
  const cancelFleet = async (fleetId: string, resources?: CombinedResources) => {
    const now = Date.now();

    await modifyFleet((fl) =>
      fl.map((f) => {
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
    await modifyFleet((fl) => fl.filter((f) => f.id !== fleetId));
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

    // Marcar sistema como no atacado
    await modifySystems((sys) =>
      sys.map((s) => (s.id === targetSystem.id ? { ...s, attackStartedAt: undefined } : s))
    );

    const battleResult = simulateBattle(
      attackingFleetData.ships, // atacantes
      targetSystem.defense, // defensores
      specs,
      {
        sistem: String(targetSystem.id),
        playerIsAttacker: true,
      }
    );

    // Guardar el combate en storage
    await insertCombatResult(battleResult);

    // Último turno = estado final
    const lastTurn =
      battleResult.turns[battleResult.turns.length - 1] ??
      ({
        turn: 0,
        attackerRemaining: attackingFleetData.ships,
        defenderRemaining: targetSystem.defense,
        attackerLost: [],
        defenderLost: [],
      } as const);

    // Flotas restantes (ShipData[])
    const updatedAttackingFleetShips = lastTurn.attackerRemaining;
    const updatedDefenseShips = lastTurn.defenderRemaining;

    // Totales para logros
    const total = (list: { amount: number }[]) => list.reduce((acc, s) => acc + s.amount, 0);
    const initialAttackers = total(attackingFleetData.ships);
    const finalAttackers = total(updatedAttackingFleetShips);

    const attackersWon = battleResult.playerWins === true;

    // Eliminar la flota atacante actual (luego la reinsertamos si corresponde)
    await modifyFleet((fl) => fl.filter((f) => f.id !== fleetId));

    if (updatedAttackingFleetShips.length > 0 && attackersWon) {
      // Ganaron los atacantes: flota regresa y el sistema queda conquistado
      await modifyFleet((fl) => {
        const now = Date.now();
        const timeSpent = attackingFleetData.endTime - attackingFleetData.startTime;

        const returningFleet = {
          ...attackingFleetData,
          ships: updatedAttackingFleetShips,
          startTime: now,
          endTime: now + timeSpent,
          destinationSystemId: attackingFleetData.origin,
          origin: attackingFleetData.destinationSystemId,
          movementType: "RETURN" as const,
        };

        const idx = fl.findIndex((f) => f.id === attackingFleetData.id);
        if (idx !== -1) {
          const next = [...fl];
          next[idx] = returningFleet;
          return next;
        }
        return [...fl, returningFleet];
      });

      if (targetSystem.race) {
        const randomEnemyRace = getHostileRace(targetSystem.race);
        if (randomEnemyRace)
          handleModifyDiplomacy(randomEnemyRace, Math.min(Math.ceil(Math.random() * 20), 5));
      }

      await modifySystems((systems) =>
        systems.map((sys) =>
          sys.id === targetSystem.id
            ? {
                ...sys,
                defense: [],
                attackStartedAt: undefined,
                race: undefined,
                starPortStartedAt: undefined,
                defended: false,
                conquered: true,
              }
            : sys
        )
      );

      // Logros
      onAchievementEvent({ type: "trigger", key: "FIRST_BATTLE_WON" });
      onAchievementEvent({ type: "increment", key: "BATTLES_WON", amount: 1 });
      if (initialAttackers === finalAttackers) {
        onAchievementEvent({ type: "trigger", key: "NO_LOSSES_BATTLE" });
      }
    } else {
      // Perdieron atacantes o empate: sistema mantiene defensa resultante
      await modifySystems((systems) =>
        systems.map((system) =>
          system.id === targetSystem.id ? { ...system, defense: updatedDefenseShips } : system
        )
      );
      // No reinsertamos flota atacante (ya fue eliminada arriba)
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
          if (f.destinationSystemId == "PLANET") handleCreateShips(f.ships);
          else handleCreateShipsInSystem(f.id);
          destroyFleet(f.id);
          break;

        case "MOVEMENT":
          if (f.destinationSystemId == "PLANET") handleCreateShips(f.ships);
          else handleCreateShipsInSystem(f.id);
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
      ships: [makeShip("PROBE", 1)],
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
      await modifyFleet((fl) => fl.filter((f) => f.id !== fleetId));
    } else {
      await cancelFleet(fleetId!);
    }

    if (!playerQuests.some((pq) => pq.type == "EXPLORE_SYSTEM" && pq.completed))
      await updateQuest({ type: "EXPLORE_SYSTEM", completed: true });

    onAchievementEvent({ type: "increment", key: "SYSTEMS_EXPLORED", amount: 1 });

    if (system.race) {
      checkNewRace(system.race);
    }
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

        return {
          ...s,
          extractionStartedAt: undefined,
          extractionBuildingBuilt: true,
          storedResources: {
            ...s.storedResources,
            resources: {},
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

    onAchievementEvent({ type: "increment", key: "ESTABLISH_COLONY", amount: 1 });
  };

  const scanFinished = async (id: string) => {
    const system = systemsRef.current.find((s) => s.id === id);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) => (s.id === id ? { ...s, scanStartedAt: undefined } : s))
    );

    if (!playerQuests.some((pq) => pq.type == "SCAN_FIRST" && pq.completed))
      await updateQuest({ type: "SCAN_FIRST", completed: true });

    onAchievementEvent({ type: "increment", key: "SYSTEMS_SCANNED", amount: 1 });
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

  const handleCreateShipsInSystem = async (fleetId: string) => {
    const flt = fleetRef.current.find((f) => f.id == fleetId);
    if (!flt) return;

    const system = systemsRef.current.find((s) => s.id === flt.destinationSystemId);
    const { resources } = system?.storedResources.resources
      ? getAccumulatedResources(system?.storedResources)
      : ({} as any);

    if (!system) {
      cancelFleet(flt.id, resources as any);
      return;
    }

    const accumulatedResources = sumCombinedResources(resources, flt.resources);
    const accumulatedFleet = sumFleet(flt.ships, system.playerShips);

    await modifySystems((systems) =>
      systems.map((s) =>
        s.id === system.id
          ? {
              ...s,
              storedResources: {
                lastUpdate: Date.now(),
                production: s.storedResources.production,
                resources: accumulatedResources,
              },
              playerShips: accumulatedFleet,
            }
          : s
      )
    );

    await destroyFleet(fleetId);
  };

  const handleDestroyShipsInSystem = async (type: ShipId, amount: number, systemId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (!system) return;

    await modifySystems((systems) =>
      systems.map((s) => {
        if (s.id !== systemId) return s;

        const updatedShips = s.playerShips
          .map((ship) =>
            ship.type === type ? { ...ship, amount: Math.max(0, ship.amount - amount) } : ship
          )
          .filter((ship) => ship.amount > 0);

        return { ...s, playerShips: updatedShips };
      })
    );
  };

  const collectSystem = async (fleetId: string) => {
    const flt = fleetRef.current.find((f) => f.id == fleetId);
    if (!flt) return;

    const system = systemsRef.current.find((s) => s.id === flt.destinationSystemId);

    const { resources } = system?.storedResources.resources
      ? getAccumulatedResources(system?.storedResources)
      : ({} as any);

    cancelFleet(flt.id, resources as any);
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
      ships: [makeShip("FREIGHTER", 1)],
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
      ships: [makeShip("PROBE", 1)],
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

    const flt = fleetRef.current.find(
      (f) => f.destinationSystemId == systemId && f.movementType == "EXPLORE SYSTEM"
    );

    if (flt) await cancelFleet(flt.id);
  };

  const cancelCollect = async (systemId: string) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (system)
      await modifySystems((systems) =>
        systems.map((s) => (s.id === systemId ? { ...s, collectStartedAt: undefined } : s))
      );

    const flt = fleetRef.current.find(
      (f) => f.destinationSystemId == systemId && f.movementType == "COLLECT"
    );

    if (flt) await cancelFleet(flt.id);
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
    const flt = fleetRef.current.find((f) => f.destinationPlanetId == planetId);
    if (flt) await cancelFleet(flt.id);
  };

  const cancelAttack = async (sistemId: string) => {
    const system = systemsRef.current.find((s) => s.id === sistemId);
    if (!system) return;

    const flt = fleetRef.current.find(
      (f) => f.destinationSystemId == sistemId && f.movementType == "ATTACK"
    );
    if (!flt) return;

    await cancelFleet(flt.id);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === sistemId ? { ...s, attackStartedAt: undefined } : s))
    );
  };

  const startAttack = async (systemId: string, fleetShips: Ship[]) => {
    const system = systemsRef.current.find((s) => s.id === systemId);
    if (!system) return;
    const slowestSpeed = Math.min(...fleetShips.map((f) => getSpecByType(f.type, specs).speed));
    const timeToAttack = getFlyTime(slowestSpeed, system.distance);

    if (system.race) handleModifyDiplomacy(system.race, -100);

    const fleetData: FleetData = {
      destinationSystemId: systemId,
      endTime: Date.now() + timeToAttack,
      movementType: "ATTACK",
      origin: "PLANET",
      ships: fleetShips,
      startTime: Date.now(),
      id: uuid.v4() as string,
      resources: {},
    };

    await newFleet(fleetData);

    await modifySystems((systems) =>
      systems.map((s) => (s.id === systemId ? { ...s, attackStartedAt: Date.now() } : s))
    );
  };

  const startFleetMovement = async (
    originSystemId: string,
    destinationSystemId: string,
    fleetShips: Ship[]
  ) => {
    const destinationSystem = systemsRef.current.find((s) => s.id === destinationSystemId);
    const originSystem = systemsRef.current.find((s) => s.id === originSystemId);

    if (destinationSystemId != "PLANET" && !destinationSystem) return;
    if (originSystemId != "PLANET" && !originSystem) return;

    const slowestSpeed = Math.min(...fleetShips.map((f) => getSpecByType(f.type, specs).speed));
    const distance = getDistance(systemsRef.current, originSystemId, originSystemId);
    const timeToTravel = getFlyTime(slowestSpeed, distance);

    const fleetData: FleetData = {
      destinationSystemId: destinationSystemId,
      endTime: Date.now() + timeToTravel,
      movementType: "MOVEMENT",
      origin: originSystemId,
      ships: fleetShips,
      startTime: Date.now(),
      id: uuid.v4() as string,
      resources: {},
    };

    await newFleet(fleetData);

    if (originSystemId == "PLANET") {
      fleetData.ships.forEach((ship) => {
        handleDestroyShip(ship.type, ship.amount);
      });
    } else {
      fleetData.ships.forEach((ship) => {
        handleDestroyShipsInSystem(ship.type, ship.amount, originSystemId);
      });
    }
  };

  const scanStarSystem = async (currentSystemId: string, id: string) => {
    const starSystem = universe[id];
    const generated: StarSystem = {
      ...generateSystem(currentSystemId, starSystem, playerDiplomacy),
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

  const resetFleet = async () => await modifyFleet(() => []);

  const resetStarSystem = async () => {
    await deleteStarSystem();
    systemsRef.current = [];
    setPlayerStarSystems([]);
  };

  const cancelMovement = async (id: string) => {
    await cancelFleet(id);
  };

  // Reexponer loaders por si los necesitas externamente
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
    startFleetMovement,
    cancelMovement,
  };
};
