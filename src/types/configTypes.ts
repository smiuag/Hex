export type ScaleSize = "SMALL" | "MEDIUM" | "LARGE";

export type ScaleValues = {
  HEX_SIZE: number;
  FACTOR: number;
  FONT_SIZE: number;
};

export type ScaleType = {
  [key in ScaleSize]: ScaleValues;
};

export type ConfigType = "MAP_SIZE" | "GAME_STARTED";

export type ConfigEntry = {
  key: ConfigType;
  value: string;
};

export type PlayerConfig = ConfigEntry[];

export const defaultPlayerConfig: PlayerConfig = [
  { key: "MAP_SIZE", value: "LARGE" },
  { key: "GAME_STARTED", value: "false" },
];

export const SCALE: ScaleType = {
  SMALL: {
    HEX_SIZE: 41,
    FACTOR: 0.8,
    FONT_SIZE: 22,
  },
  MEDIUM: {
    HEX_SIZE: 60,
    FACTOR: 1.2,
    FONT_SIZE: 34,
  },
  LARGE: {
    HEX_SIZE: 78,
    FACTOR: 1.5,
    FONT_SIZE: 38,
  },
};

export const scaleKeys = Object.keys(SCALE) as ScaleSize[];
