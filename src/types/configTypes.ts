export type ScaleSize = "SMALL" | "MEDIUM" | "LARGE";

export type ScaleValues = {
  HEX_SIZE: number;
  FACTOR: number;
  FONT_SIZE: number;
};

export type ScaleType = {
  [key in ScaleSize]: ScaleValues;
};

export type ConfigType = "MAP_SIZE";

export type ConfigEntry = {
  key: string;
  value: string;
};

export type PlayerConfig = ConfigEntry[];

export const defaultPlayerConfig: PlayerConfig = [
  { key: "MAP_SIZE", value: "LARGE" },
];

export const SCALE: ScaleType = {
  SMALL: {
    HEX_SIZE: 40,
    FACTOR: 0.82,
    FONT_SIZE: 22,
  },
  MEDIUM: {
    HEX_SIZE: 60,
    FACTOR: 1.25,
    FONT_SIZE: 34,
  },
  LARGE: {
    HEX_SIZE: 80,
    FACTOR: 1.7,
    FONT_SIZE: 38,
  },
};

export const scaleKeys = Object.keys(SCALE) as ScaleSize[];
