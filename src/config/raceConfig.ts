import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { RaceType } from "../types/raceType";

export const raceConfig: Record<
  RaceType,
  {
    name: string;
    type: RaceType;
    hostiles: RaceType[];
    emblem: ImageSourcePropType;
    starting: boolean;
  }
> = {
  RACE1: {
    name: "Humanos",
    type: "RACE1",
    hostiles: [],
    emblem: IMAGES.RACE1,
    starting: true,
  },
  RACE2: {
    name: "Valkorian",
    type: "RACE2",
    hostiles: ["RACE5", "RACE3"],
    emblem: IMAGES.RACE2,
    starting: true,
  },
  RACE3: {
    name: "Vrinoresh",
    type: "RACE3",
    hostiles: ["RACE2", "RACE4"],
    emblem: IMAGES.RACE3,
    starting: true,
  },
  RACE4: {
    name: "Grugndegnhor",
    type: "RACE4",
    hostiles: ["RACE2", "RACE5"],
    emblem: IMAGES.RACE4,
    starting: true,
  },
  RACE5: {
    name: "Trjngwls",
    type: "RACE5",
    hostiles: ["RACE2", "RACE4"],
    emblem: IMAGES.RACE5,
    starting: true,
  },
  RACE6: {
    name: "Facundianos",
    type: "RACE6",
    hostiles: ["RACE7"],
    emblem: IMAGES.RACE6,
    starting: false,
  },
  RACE7: {
    name: "Qhârzul",
    type: "RACE7",
    hostiles: ["RACE8"],
    emblem: IMAGES.RACE7,
    starting: false,
  },
  RACE8: {
    name: "Vexanitas",
    type: "RACE8",
    hostiles: ["RACE9"],
    emblem: IMAGES.RACE8,
    starting: false,
  },
  RACE9: {
    name: "Thol’kesh",
    type: "RACE9",
    hostiles: ["RACE10"],
    emblem: IMAGES.RACE9,
    starting: false,
  },
  RACE10: {
    name: "Miridianos",
    type: "RACE10",
    hostiles: ["RACE6"],
    emblem: IMAGES.RACE10,
    starting: false,
  },
};
