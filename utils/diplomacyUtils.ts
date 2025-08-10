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
