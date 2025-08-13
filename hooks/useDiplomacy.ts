import {
  deleteCurrentEvent,
  deleteDiplomacy,
  loadCurrentEvent,
  loadDiplomacy,
  saveCurrentEvent,
  saveDiplomacy,
} from "@/src/services/storage";
import {
  DIPLOMACY_CHANGE_LEVEL,
  DiplomaticEvent,
  EventEffect,
  EventOption,
  makeDefaultEvent,
} from "@/src/types/eventTypes";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";
import { CombinedResources, CombinedResourcesType } from "@/src/types/resourceTypes";
import { Ship, ShipData, ShipType } from "@/src/types/shipType";
import { simulateBattle } from "@/utils/combat";
import { buildDefault, isExpired, normalizeToAllRaces } from "@/utils/diplomacyUtils";
import { getRandomEvent } from "@/utils/eventUtil";
import { getShips } from "@/utils/shipUtils";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

export const useDiplomacy = (
  shipBuildQueue: Ship[],
  handleDestroyShip: (type: ShipType, amount: number) => void,
  handleCreateShips: (shipsToAdd: { type: ShipType; amount: number }[]) => void,
  addResources: (modifications: Partial<CombinedResources>) => void,
  subtractResources: (modifications: Partial<CombinedResources>) => void,
  discoverNextResearch: () => void,
  stopResearch: () => void,
  stopConstruction: () => void,
  bombingSystem: () => void
) => {
  const [playerDiplomacy, setPlayerDiplomacy] = useState<DiplomacyLevel[]>([]);
  const [currentEvent, setCurrentEvent] = useState<DiplomaticEvent>(makeDefaultEvent());
  const diplomacyRef = useRef<DiplomacyLevel[]>([]);
  const eventRef = useRef<DiplomaticEvent>(makeDefaultEvent());

  const { t: tEvent } = useTranslation("events");
  const { t: tShip } = useTranslation("ship");

  const router = useRouter();

  const syncAndSave = async (diplomacy: DiplomacyLevel[]) => {
    const normalized = normalizeToAllRaces(diplomacy);
    diplomacyRef.current = normalized;
    setPlayerDiplomacy(normalized);
    await saveDiplomacy(normalized);
  };

  const syncAndSaveEvent = async (event: DiplomaticEvent) => {
    eventRef.current = event;
    setCurrentEvent(event);
    await saveCurrentEvent(event);
  };

  const modifyDiplomacy = async (modifier: (prev: DiplomacyLevel[]) => DiplomacyLevel[]) => {
    const next = modifier(diplomacyRef.current);
    await syncAndSave(next);
  };

  const modifyEvent = async (modifier: (prev: DiplomaticEvent) => DiplomaticEvent) => {
    const next = modifier(eventRef.current);
    await syncAndSaveEvent(next);
  };

  const handleEventOptionChoose = async (option: EventOption) => {
    await modifyEvent((prev) => {
      return { ...prev, completed: true, completedTime: Date.now() };
    });

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
      if (effect.trade.shipChange) {
        const shipsToAdd: ShipData[] = [];
        effect.trade.shipChange.forEach((data) => {
          if (data.amount > 0) shipsToAdd.push(data);
          else {
            handleDestroyShip(data.type, data.amount);
          }
        });

        await handleCreateShips(shipsToAdd);
      }
    }

    if (effect.trade?.resourceChange) {
      const resourcesToAdd: Partial<CombinedResources> = {};
      const resourcesToSubtract: Partial<CombinedResources> = {};

      for (const [k, v] of Object.entries(effect.trade.resourceChange)) {
        const type = k as CombinedResourcesType; // p.ej. "metal" | "energy" | ...
        const amount = typeof v === "number" ? v : 0;

        if (amount > 0) {
          const key = type as keyof CombinedResources;
          resourcesToAdd[key] = (resourcesToAdd[key] ?? 0) + Math.abs(amount);
        }

        if (amount < 0) {
          const key = type as keyof CombinedResources;
          resourcesToSubtract[key] = (resourcesToAdd[key] ?? 0) + Math.abs(amount);
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

    if (effect.type == "INSTANT_ATTACK" && effect.attackingShips) {
      const attackingShips = getShips(effect.attackingShips);
      const battleResult = simulateBattle(attackingShips, shipBuildQueue);

      const updatedAttackingFleetShips = battleResult.remaining.fleetA;
      const updatedDefenseShips = battleResult.remaining.fleetB;

      await Promise.all(
        shipBuildQueue.map((ship) => {
          const remaining = updatedDefenseShips.find((r) => r.type === ship.type)?.amount ?? 0;
          const amount = Math.max(0, ship.amount - remaining);
          return amount > 0 ? handleDestroyShip(ship.type, amount) : Promise.resolve();
        })
      );

      if (updatedAttackingFleetShips.length > 0) {
        await bombingSystem();
      }
    }

    if (effect.sabotage) {
      await stopResearch();
      await stopConstruction();
    }
  };

  const handleModifyDiplomacy = async (race: RaceType, change: number) => {
    await modifyDiplomacy((prev) => {
      let found = false;
      const updated = prev.map((entry) => {
        if (entry.race === race) {
          found = true;
          return { ...entry, diplomacyLevel: entry.diplomacyLevel + change };
        }
        return entry;
      });
      return found ? updated : [...updated, { race, diplomacyLevel: 500 + change }];
    });
  };

  const loadPlayerDiplomacy = async () => {
    const saved = await loadDiplomacy();
    if (saved && Array.isArray(saved)) {
      await syncAndSave(saved as DiplomacyLevel[]);
    } else {
      await syncAndSave(buildDefault());
    }
  };

  const loadEvent = async () => {
    const saved = await loadCurrentEvent();

    if (saved && saved.type !== "DEFAULT" && !isExpired(saved)) {
      await syncAndSaveEvent(saved);
      return;
    }

    await handleEventUnsolved();

    Alert.alert("Embajada", "Algo ocurre en el planeta. Visita la embajada para más información", [
      { text: "cancelar", style: "cancel" },
      {
        text: "Aceptar",
        onPress: async () => {
          router.replace("/(tabs)/planet/embassy");
        },
      },
    ]);

    const newEvent = await getRandomEvent(
      tEvent as unknown as (key: string, options?: object) => string,
      tShip as unknown as (key: string, options?: object) => string,
      shipBuildQueue,
      playerDiplomacy
    );
    await syncAndSaveEvent(newEvent ?? makeDefaultEvent());
  };

  const handleEventUnsolved = async () => {
    const option = eventRef.current.options.find((op) => op.type == "IGNORE");
    if (option) handleEventOptionChoose(option);
  };

  const resetPlayerDiplomacy = async () => {
    await deleteDiplomacy();
    await syncAndSave(buildDefault());
  };

  const resetPlayerEvent = async () => {
    await deleteCurrentEvent();
    await syncAndSaveEvent(makeDefaultEvent());
  };

  useEffect(() => {
    loadPlayerDiplomacy();
    loadEvent();
  }, []);

  return {
    playerDiplomacy,
    currentEvent,
    handleModifyDiplomacy,
    loadPlayerDiplomacy,
    resetPlayerDiplomacy,
    resetPlayerEvent,
    handleEventOptionChoose,
    loadEvent,
    modifyEvent,
  };
};
