import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";

export const ALL_RACES = ["RACE1", "RACE2", "RACE3", "RACE4", "RACE5"] as const;
export type RaceType = (typeof ALL_RACES)[number];

export const raceConfig: Record<
  RaceType,
  {
    name: string;
    type: RaceType;
    hostiles: RaceType[];
    emblem: ImageSourcePropType;
  }
> = {
  RACE1: {
    name: "Humanos",
    type: "RACE1",
    hostiles: [],
    emblem: IMAGES.RACE1,
  },
  RACE2: {
    name: "Valkorian",
    type: "RACE2",
    hostiles: ["RACE5", "RACE3"],
    emblem: IMAGES.RACE2,
  },
  RACE3: {
    name: "Vrinoresh",
    type: "RACE3",
    hostiles: ["RACE2", "RACE4"],
    emblem: IMAGES.RACE3,
  },
  RACE4: {
    name: "Grugndegnhor",
    type: "RACE4",
    hostiles: ["RACE2", "RACE5"],
    emblem: IMAGES.RACE4,
  },
  RACE5: {
    name: "Trjngwls",
    type: "RACE5",
    hostiles: ["RACE2", "RACE4"],
    emblem: IMAGES.RACE5,
  },
};

export type DiplomacyLevel = {
  race: RaceType;
  diplomacyLevel: number;
};
