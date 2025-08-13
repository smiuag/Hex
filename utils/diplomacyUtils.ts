import { DiplomaticEvent } from "@/src/types/eventTypes";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";

const RACES: RaceType[] = ["RACE1", "RACE2", "RACE3", "RACE4", "RACE5"];

export const buildDefault = (): DiplomacyLevel[] =>
  RACES.map((race) => ({ race, diplomacyLevel: 500 }));

export const normalizeToAllRaces = (list: DiplomacyLevel[]): DiplomacyLevel[] => {
  const byRace = new Map<RaceType, DiplomacyLevel>(list.map((e) => [e.race, e]));

  RACES.forEach((race) => {
    if (!byRace.has(race)) {
      byRace.set(race, { race, diplomacyLevel: 500 });
    }
  });

  return RACES.map((race) => byRace.get(race)!);
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
