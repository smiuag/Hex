export type ScaleSize = "SMALL" | "MEDIUM" | "LARGE";

export type ScaleValues = {
  HEX_SIZE: number;
  FACTOR: number;
  FONT_SIZE: number;
  Y_ADJUST: number;
};

export type ScaleType = {
  [key in ScaleSize]: ScaleValues;
};

// export type ConfigType =
//   | "MAX_CREATION_STATS"
//   | "MAP_SIZE"
//   | "GAME_STARTED"
//   | "STARTING_SYSTEM"
//   | "HAS_ANTENNA"
//   | "HAS_HANGAR"
//   | "HAS_EMBASSY"
//   | "ALIEN_STRUCTURE_FOUND"
//   | "RACE"
//   | "PLANET_NAME"
//   | "PLAYER_NAME"
//   | "PLAYER_LANGUAGE";

type MaxCreationStats = { attack: number; defense: number; speed: number; hp: number };

export type ConfigValueByKey = {
  MAP_SIZE: "SMALL" | "MEDIUM" | "LARGE";
  GAME_STARTED: boolean;
  RACE: "RACE1" | "RACE2" | "RACE3" | "RACE4" | "RACE5" | string;
  PLANET_NAME: string;
  PLAYER_NAME: string;
  STARTING_SYSTEM: string;
  HAS_ANTENNA: string;
  HAS_HANGAR: string;
  HAS_EMBASSY: string;
  ALIEN_STRUCTURE_FOUND: boolean;
  PLAYER_LANGUAGE: "es" | "en" | string;
  MAX_CREATION_STATS: MaxCreationStats; // <— nuevo objeto
};

export type ConfigType = keyof ConfigValueByKey;

// 2) Entrada tipada (discriminada por key)
export type ConfigEntry<K extends ConfigType = ConfigType> = {
  key: K;
  value: ConfigValueByKey[K];
};

export type PlayerConfig = ConfigEntry[];

// 3) Defaults ya con tipos correctos (booleans de verdad, etc.)
export const defaultPlayerConfig: PlayerConfig = [
  { key: "MAP_SIZE", value: "LARGE" },
  { key: "GAME_STARTED", value: false },
  { key: "RACE", value: "RACE1" },
  { key: "PLANET_NAME", value: "Colonia última esperanza" },
  { key: "PLAYER_NAME", value: "Lucas Vera" },
  { key: "PLAYER_LANGUAGE", value: "es" },
  { key: "MAX_CREATION_STATS", value: { attack: 8, defense: 8, speed: 200, hp: 20 } },
];
export const SCALE: ScaleType = {
  SMALL: {
    HEX_SIZE: 41,
    FACTOR: 0.8,
    FONT_SIZE: 22,
    Y_ADJUST: 40,
  },
  MEDIUM: {
    HEX_SIZE: 60,
    FACTOR: 1.2,
    FONT_SIZE: 34,
    Y_ADJUST: 40,
  },
  LARGE: {
    HEX_SIZE: 78,
    FACTOR: 1.5,
    FONT_SIZE: 38,
    Y_ADJUST: 40,
  },
};

export const scaleKeys = Object.keys(SCALE) as ScaleSize[];
