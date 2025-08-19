import { raceConfig } from "@/src/config/raceConfig";
import {
  deleteCurrentEvent,
  deleteDiplomacy,
  loadCurrentEvent,
  loadDiplomacy,
  saveCurrentEvent,
  saveDiplomacy,
} from "@/src/services/storage";
import { AchievementEvent } from "@/src/types/achievementTypes";
import { PlayerConfig } from "@/src/types/configTypes";
import {
  DIPLOMACY_CHANGE_LEVEL,
  DiplomaticEvent,
  EventEffect,
  EventOption,
  makeDefaultEvent,
} from "@/src/types/eventTypes";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";
import {
  CombinedResources,
  CombinedResourcesType,
  StoredResources,
} from "@/src/types/resourceTypes";
import { Ship, ShipData, ShipId, ShipSpecsCtx } from "@/src/types/shipType";
import { simulateBattle } from "@/utils/combatUtils";
import { hasEmbassyBuilt } from "@/utils/configUtils";
import { buildDefault, isExpired, normalizeToAllRaces } from "@/utils/diplomacyUtils";
import { getRandomEvent } from "@/utils/eventUtil";
import { tSafeNS } from "@/utils/generalUtils";
import { getAccumulatedResources } from "@/utils/resourceUtils";
import { getShips, makeShip } from "@/utils/shipUtils";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

export const useDiplomacy = (
  shipBuildQueue: Ship[],
  playerConfig: PlayerConfig,
  resources: StoredResources,
  specs: ShipSpecsCtx,
  handleDestroyShip: (type: ShipId, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipId; amount: number }[]) => void,
  addResources: (modifications: Partial<CombinedResources>) => void,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  discoverNextResearch: () => void,
  stopResearch: () => void,
  stopConstruction: () => void,
  bombingSystem: () => void,
  onAchievementEvent: (ev: AchievementEvent) => void
) => {
  const [playerDiplomacy, setPlayerDiplomacy] = useState<DiplomacyLevel[]>([]);
  const [currentEvent, setCurrentEvent] = useState<DiplomaticEvent>(makeDefaultEvent());
  const diplomacyRef = useRef<DiplomacyLevel[]>([]);
  const eventRef = useRef<DiplomaticEvent>(makeDefaultEvent());
  const tEvent = useMemo(() => tSafeNS("events"), []);
  const tShip = useMemo(() => tSafeNS("ship"), []);

  const router = useRouter();

  // Colas de guardado + flags de hidratación
  const diplomacySaveChain = useRef(Promise.resolve());
  const eventSaveChain = useRef(Promise.resolve());
  const diplomacyHydrated = useRef(false);
  const eventHydrated = useRef(false);

  // Persistencia en serie: diplomacia
  useEffect(() => {
    if (!diplomacyHydrated.current) {
      diplomacyHydrated.current = true;
      return;
    }
    const snapshot = diplomacyRef.current;
    diplomacySaveChain.current = diplomacySaveChain.current
      .then(() => saveDiplomacy(snapshot))
      .catch((e) => console.error("Error saving diplomacy:", e));
  }, [playerDiplomacy]);

  // Persistencia en serie: evento diplomático actual
  useEffect(() => {
    if (!eventHydrated.current) {
      eventHydrated.current = true;
      return;
    }
    const snapshot = eventRef.current;
    eventSaveChain.current = eventSaveChain.current
      .then(() => saveCurrentEvent(snapshot))
      .catch((e) => console.error("Error saving current event:", e));
  }, [currentEvent]);

  // Helpers: modificar estado de forma funcional y sincronizar refs
  const modifyDiplomacy = (modifier: (prev: DiplomacyLevel[]) => DiplomacyLevel[]) => {
    setPlayerDiplomacy((prev) => {
      const next = normalizeToAllRaces(modifier(prev));
      diplomacyRef.current = next;
      return next;
    });
  };

  const modifyEvent = (modifier: (prev: DiplomaticEvent) => DiplomaticEvent) => {
    setCurrentEvent((prev) => {
      const next = modifier(prev);
      eventRef.current = next;
      return next;
    });
  };

  const handleEventOptionChoose = async (option: EventOption) => {
    modifyEvent((prev) => ({
      ...prev,
      completed: true,
      completedTime: Date.now(),
      optionChosed: option.type,
    }));
    option.effects.forEach((effect) => {
      handleEffectResolved(effect);
    });
  };

  const handleEffectResolved = async (effect: EventEffect) => {
    if (effect.diplomacy) {
      effect.diplomacy.forEach((diplomacy) => {
        handleModifyDiplomacy(diplomacy.race, DIPLOMACY_CHANGE_LEVEL[diplomacy.change]);
      });
    }

    if (effect.trade) {
      let shipsDeltaAbs = 0;
      if (effect.trade.shipChange) {
        const shipsToAdd: ShipData[] = [];
        effect.trade.shipChange.forEach((data) => {
          if (data.amount > 0) {
            shipsDeltaAbs += data.amount;
            shipsToAdd.push(makeShip(data.type, data.amount));
          } else {
            // amount negativo => destruir cantidad absoluta
            handleDestroyShip(data.type, Math.abs(data.amount));
          }
        });

        if (shipsDeltaAbs > 0) {
          onAchievementEvent({ type: "increment", key: "SHIPS_TRADED", amount: shipsDeltaAbs });
        }

        if (shipsToAdd.length > 0) {
          await handleCreateShips(shipsToAdd);
        }
      }

      onAchievementEvent({ type: "trigger", key: "FIRST_TRADE" });
      onAchievementEvent({ type: "increment", key: "TRADES_COMPLETED", amount: 1 });
      onAchievementEvent({ type: "addToSet", key: "TRADE_PARTNERS", itemId: currentEvent.races });
    }

    if (effect.trade?.resourceChange) {
      const resourcesToAdd: Partial<CombinedResources> = {};
      const resourcesToSubtract: Partial<CombinedResources> = {};

      for (const [k, v] of Object.entries(effect.trade.resourceChange)) {
        const type = k as CombinedResourcesType;
        const amount = typeof v === "number" ? v : 0;

        if (amount > 0) {
          const key = type as keyof CombinedResources;
          resourcesToAdd[key] = (resourcesToAdd[key] ?? 0) + Math.abs(amount);
        }

        if (amount < 0) {
          const key = type as keyof CombinedResources;
          resourcesToSubtract[key] = (resourcesToSubtract[key] ?? 0) + Math.abs(amount);
        }
      }

      if (Object.keys(resourcesToAdd).length) {
        await addResources(resourcesToAdd);
      }
      if (Object.keys(resourcesToSubtract).length) {
        await subtractResources(resourcesToSubtract);
      }
    }

    if (effect.trade?.specialReward) {
      await discoverNextResearch();
    }

    if (effect.type === "INSTANT_ATTACK" && effect.attackingShips) {
      // Atacantes (del efecto) ya en ShipData[]
      const attackingShips: ShipData[] = getShips(effect.attackingShips);

      // Defensores: si tu cola/estado son Ship[] convierto a ShipData[]
      const defenders: ShipData[] = shipBuildQueue.map((s: Ship) => makeShip(s.type, s.amount));

      // Simular con la nueva firma; en un evento el jugador NO es atacante
      const battleResult = simulateBattle(attackingShips, defenders, specs, {
        sistem: "EVENT",
        playerIsAttacker: false,
        // date: Date.now(),
        // maxTurns: 10000,
      });

      // Último turno = estado final
      const lastTurn = battleResult.turns[battleResult.turns.length - 1];

      const updatedAttackingFleetShips = lastTurn.attackerRemaining; // enemigos que quedan
      const updatedDefenseShips = lastTurn.defenderRemaining; // tus defensas que quedan

      // Ajustar inventario de naves defensivas: destruir la diferencia
      await Promise.all(
        shipBuildQueue.map((ship: Ship) => {
          const remaining = updatedDefenseShips.find((r) => r.type === ship.type)?.amount ?? 0;
          const destroyed = Math.max(0, ship.amount - remaining);
          return destroyed > 0 ? handleDestroyShip(ship.type, destroyed) : Promise.resolve();
        })
      );

      // Si quedan atacantes vivos, procede a bombardeo
      if (updatedAttackingFleetShips.length > 0) {
        await bombingSystem();
      }

      // (Opcional) guardar el combate en tu storage si usas historial
      // await insertCombatResult(battleResult);
    }

    if (effect.sabotage) {
      await stopResearch();
      await stopConstruction();
    }
  };

  const handleModifyDiplomacy = async (race: RaceType, change: number) => {
    modifyDiplomacy((prev) => {
      let found = false;
      const updated = prev.map((entry) => {
        if (entry.race === race) {
          found = true;
          return { ...entry, diplomacyLevel: entry.diplomacyLevel + change };
        }
        return entry;
      });
      return found
        ? updated
        : [
            ...updated,
            { race, diplomacyLevel: 500 + change, discovered: raceConfig[race].starting },
          ];
    });

    const allBelow300 =
      diplomacyRef.current.length > 0 && diplomacyRef.current.every((d) => d.diplomacyLevel < 300);

    if (allBelow300) onAchievementEvent({ type: "trigger", key: "NO_FRIENDS" });
  };

  const loadPlayerDiplomacy = async () => {
    const saved = await loadDiplomacy();
    if (saved && Array.isArray(saved)) {
      const normalized = normalizeToAllRaces(saved as DiplomacyLevel[]);
      diplomacyRef.current = normalized;
      setPlayerDiplomacy(normalized);
    } else {
      const def = buildDefault();
      diplomacyRef.current = def;
      setPlayerDiplomacy(def);
    }
  };

  const handleEventUnsolved = async () => {
    const option = eventRef.current.options.find((op) => op.type == "IGNORE");
    if (option) handleEventOptionChoose(option);
  };

  const loadEvent = async () => {
    const hasEmbassy = hasEmbassyBuilt(playerConfig);

    if (hasEmbassy) {
      const saved = await loadCurrentEvent();

      if (saved && saved.type !== "DEFAULT" && !isExpired(saved)) {
        eventRef.current = saved;
        setCurrentEvent(saved);
        return;
      }

      await handleEventUnsolved();

      Alert.alert(
        "Embajada",
        "Algo ocurre en el planeta. Visita la embajada para más información",
        [
          { text: "cancelar", style: "cancel" },
          {
            text: "Aceptar",
            onPress: async () => {
              router.replace("/(tabs)/planet/embassy");
            },
          },
        ]
      );

      const { resources: accumulatedResources } = getAccumulatedResources(resources, Date.now());
      const newEvent = await getRandomEvent(
        tEvent as unknown as (key: string, options?: object) => string,
        tShip as unknown as (key: string, options?: object) => string,
        accumulatedResources,
        shipBuildQueue,
        playerDiplomacy
      );
      const finalEvent = newEvent ?? makeDefaultEvent();
      eventRef.current = finalEvent;
      setCurrentEvent(finalEvent);
    }
  };

  const checkNewRace = (race: RaceType) => {
    if (!playerDiplomacy.find((pd) => pd.race == race && pd.discovered)) {
      modifyDiplomacy((prev) => {
        const exists = prev.some((d) => d.race === race);
        if (exists) {
          return prev.map((d) => (d.race === race ? { ...d, discovered: true } : d));
        }
        return [...prev, { race, diplomacyLevel: 500, discovered: true }];
      });
      Alert.alert("Nueva raza contactada!", `Visita la embajada para más información`);
    }
  };

  const resetPlayerDiplomacy = async () => {
    await deleteDiplomacy();
    const def = buildDefault();
    diplomacyRef.current = def;
    setPlayerDiplomacy(def);
  };

  const resetPlayerEvent = async () => {
    await deleteCurrentEvent();
    const def = makeDefaultEvent();
    eventRef.current = def;
    setCurrentEvent(def);
  };

  useEffect(() => {
    loadPlayerDiplomacy();
    loadEvent();
  }, [playerConfig]);

  return {
    playerDiplomacy,
    currentEvent,
    checkNewRace,
    handleModifyDiplomacy,
    loadPlayerDiplomacy,
    resetPlayerDiplomacy,
    resetPlayerEvent,
    handleEventOptionChoose,
    modifyEvent,
  };
};
