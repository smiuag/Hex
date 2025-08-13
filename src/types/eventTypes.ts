import { RaceType } from "./raceType";
import { CombinedResources } from "./resourceTypes";
import { ShipData } from "./shipType";

export const ALL_EVENT_TYPES = ["COMERCIAL", "EXTORTION", "INFILTRATION", "DEFAULT"] as const;
export type EventType = (typeof ALL_EVENT_TYPES)[number];

export const DIPLOMACY_CHANGE_LEVEL = {
  SMALL_INCREASE: 20,
  MEDIUM_INCREASE: 40,
  LARGE_INCREASE: 60,
  SMALL_DECREASE: -20,
  MEDIUM_DECREASE: -40,
  LARGE_DECREASE: -60,
} as const;

export const POSITIVE_CHANGE_KEYS = [
  "SMALL_INCREASE",
  "MEDIUM_INCREASE",
  "LARGE_INCREASE",
] as const;

export type PositiveChangeLevel = (typeof POSITIVE_CHANGE_KEYS)[number];

export const NEGATIVE_CHANGE_KEYS = [
  "SMALL_DECREASE",
  "MEDIUM_DECREASE",
  "LARGE_DECREASE",
] as const;

export type NegativeChangeLevel = (typeof NEGATIVE_CHANGE_KEYS)[number];

export const DIPLOMACY_CHANGE_OPPOSITE = {
  SMALL_INCREASE: "SMALL_DECREASE",
  MEDIUM_INCREASE: "MEDIUM_DECREASE",
  LARGE_INCREASE: "LARGE_DECREASE",
  SMALL_DECREASE: "SMALL_INCREASE",
  MEDIUM_DECREASE: "MEDIUM_INCREASE",
  LARGE_DECREASE: "LARGE_INCREASE",
} as const;

export const DIPLOMACY_TRADE_VALUE = {
  STONE: { TYPE: "RESOURCE", COST: 1, RESTRICTED: false, WANTED: false, CHANCE: 0, MAX: 0 },
  METAL: { TYPE: "RESOURCE", COST: 1.2, RESTRICTED: false, WANTED: false, CHANCE: 0, MAX: 0 },
  CRYSTAL: { TYPE: "RESOURCE", COST: 1.5, RESTRICTED: false, WANTED: false, CHANCE: 0, MAX: 0 },
  ILMENITA: {
    TYPE: "RESOURCE",
    COST: 300,
    RESTRICTED: false,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 100000,
  },
  AETHERIUM: {
    TYPE: "RESOURCE",
    COST: 400,
    RESTRICTED: false,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 100000,
  },
  THARNIO: {
    TYPE: "RESOURCE",
    COST: 350,
    RESTRICTED: false,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 100000,
  },
  KAIROX: {
    TYPE: "RESOURCE",
    COST: 400,
    RESTRICTED: false,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 100000,
  },
  NEBULITA: {
    TYPE: "RESOURCE",
    COST: 250,
    RESTRICTED: false,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 100000,
  },
  ASSAULTBATTLESHIP: {
    TYPE: "SHIP",
    COST: 2000000,
    RESTRICTED: true,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 5,
  },
  STARCARRIER: { TYPE: "SHIP", COST: 2300000, RESTRICTED: true, WANTED: true, CHANCE: 0.1, MAX: 4 },
  HEAVYASSAULTSHIP: {
    TYPE: "SHIP",
    COST: 2500000,
    RESTRICTED: true,
    WANTED: true,
    CHANCE: 0.1,
    MAX: 3,
  },
  ORBITALASSAULTSHIP: {
    TYPE: "SHIP",
    COST: 2750000,
    RESTRICTED: true,
    WANTED: true,
    CHANCE: 0.05,
    MAX: 2,
  },
  PLANETARYDESTROYER: {
    TYPE: "SHIP",
    COST: 3000000,
    RESTRICTED: true,
    WANTED: true,
    CHANCE: 0.03,
    MAX: 1,
  },
  NEW_RECIPE: {
    TYPE: "SPECIAL",
    COST: 5000000,
    RESTRICTED: true,
    WANTED: true,
    CHANCE: 0.02,
    MAX: 1,
  },
} as const;

export type DiplomacyChangeLevel = keyof typeof DIPLOMACY_CHANGE_LEVEL;

export type EventOptionsType = "TRADE" | "FIGHT" | "DIPLOMACY" | "RETRIBUTION" | "IGNORE";

export type EventEffectType =
  | "RESOURCE_CHANGE"
  | "DIPLOMACY_CHANGE"
  | "INSTANT_ATTACK"
  | "SABOTAGE";

export type DiplomacyChange = {
  race: RaceType;
  change: DiplomacyChangeLevel;
};
export type Trade = {
  resourceChange?: Partial<CombinedResources>;
  shipChange?: ShipData[];
  specialReward: boolean;
};

export type EventEffect = {
  type: EventEffectType;
  diplomacy?: DiplomacyChange[];
  trade?: Trade;
  attackingShips?: ShipData[];
  sabotage: boolean;
};

export type EventOption = {
  type: EventOptionsType;
  effects: EventEffect[];
  description: string;
};

export type DiplomaticEvent = {
  type: EventType;
  races: RaceType;
  hostile: boolean;
  endTime: number;
  completed: boolean;
  completedTime?: number;
  options: EventOption[];
  title: string;
  description: string;
  mainTrade?: Trade;
};

export const makeDefaultEvent = (): DiplomaticEvent => ({
  type: "DEFAULT",
  completed: false,
  description: "",
  endTime: Date.now(),
  hostile: false,
  options: [],
  races: "RACE1",
  title: "",
});
