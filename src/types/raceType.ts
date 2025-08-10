export const ALL_RACES = ["RACE1", "RACE2", "RACE3", "RACE4", "RACE5"] as const;
export type RaceType = (typeof ALL_RACES)[number];

export const raceConfig: Record<
  RaceType,
  {
    name: string;
    type: RaceType;
    hostiles: RaceType[];
  }
> = {
  RACE1: {
    name: "Humanos",
    type: "RACE1",
    hostiles: [],
  },
  RACE2: {
    name: "Valkorian",
    type: "RACE2",
    hostiles: ["RACE5", "RACE3"],
  },
  RACE3: {
    name: "V'rinor-esh",
    type: "RACE3",
    hostiles: ["RACE2", "RACE4"],
  },
  RACE4: {
    name: "Grugn-degn'hor",
    type: "RACE4",
    hostiles: ["RACE2", "RACE5"],
  },
  RACE5: {
    name: "Trjngwls",
    type: "RACE5",
    hostiles: ["RACE2", "RACE4"],
  },
};

export type DiplomacyLevel = {
  race: RaceType;
  diplomacyLevel: number;
};
