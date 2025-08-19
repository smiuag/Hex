export const ALL_RACES = [
  "RACE1",
  "RACE2",
  "RACE3",
  "RACE4",
  "RACE5",
  "RACE6",
  "RACE7",
  "RACE8",
  "RACE9",
  "RACE10",
] as const;
export type RaceType = (typeof ALL_RACES)[number];

export const RACES: RaceType[] = [
  "RACE1",
  "RACE2",
  "RACE3",
  "RACE4",
  "RACE5",
  "RACE6",
  "RACE7",
  "RACE8",
  "RACE9",
  "RACE10",
];

export type DiplomacyLevel = {
  race: RaceType;
  diplomacyLevel: number;
  discovered: boolean;
};
