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

export type ConfigType =
  | "MAP_SIZE"
  | "GAME_STARTED"
  | "STARTING_SYSTEM"
  | "HAS_ANTENNA"
  | "HAS_HANGAR"
  | "HAS_EMBASSY"
  | "ALIEN_STRUCTURE_FOUND"
  | "RACE"
  | "PLANET_NAME"
  | "PLAYER_NAME"
  | "PLAYER_LANGUAGE";

export type ConfigEntry = {
  key: ConfigType;
  value: string;
};

export type PlayerConfig = ConfigEntry[];

export const defaultPlayerConfig: PlayerConfig = [
  { key: "MAP_SIZE", value: "LARGE" },
  { key: "GAME_STARTED", value: "false" },
  { key: "RACE", value: "RACE1" },
  { key: "PLANET_NAME", value: "Colonia última esperanza" },
  { key: "PLAYER_NAME", value: "Lucas Vera" },
  { key: "PLAYER_LANGUAGE", value: "es" },
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
