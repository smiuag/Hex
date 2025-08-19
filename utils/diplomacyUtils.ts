import { raceConfig } from "@/src/config/raceConfig";
import { DiplomaticEvent } from "@/src/types/eventTypes";
import { DiplomacyLevel, RACES, RaceType } from "@/src/types/raceType";

export const buildDefault = (): DiplomacyLevel[] =>
  RACES.map((race) => ({ race, diplomacyLevel: 500, discovered: raceConfig[race].starting }));

export const normalizeToAllRaces = (list: DiplomacyLevel[]): DiplomacyLevel[] => {
  const byRace = new Map<RaceType, DiplomacyLevel>(list.map((e) => [e.race, e]));

  return RACES.map((race) => {
    const existing = byRace.get(race);

    if (!existing) {
      return {
        race,
        diplomacyLevel: 500,
        discovered: raceConfig[race].starting,
      };
    }

    return {
      ...existing,
      discovered: existing.discovered ?? raceConfig[race].starting,
    };
  });
};

export const isExpired = (event: DiplomaticEvent): boolean => {
  if (!event || event.type === "DEFAULT") return true;
  if (
    event.completed &&
    event.completedTime &&
    Date.now() - event.completedTime >= 12 * 60 * 60 * 1000
  ) {
    return true;
  }
  if (event.endTime === 0) return false;
  return event.endTime <= Date.now();
};
