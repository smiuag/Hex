export const GENERAL_FACTOR = 100; // 1- NORMAL, 10-ACELERADO PARA PRUEBAS

export const PRODUCTION_INCREMENT = 1.3;
export const BUILD_COST_INCREMENT = 1.5;
export const RESEARCH_COST_INCREMENT = 1.5;
export const BUILD_TIME_INCREMENT = 1.7;
export const RESEARCH_TIME_INCREMENT = 1.5;

export type MapSizeKey = keyof typeof MAP_SIZES;

export const MAP_SIZES = {
  SMALL: {
    X: 0.83,
    Y: 0.83,
    WIDTH: 0.83,
    HEIGHT: 0.83,
    HEX_SIZE: 40,
    FONT_SIZE: 26,
  },
  MEDIUM: {
    X: 1.26,
    Y: 1.26,
    WIDTH: 1.26,
    HEIGHT: 1.26,
    HEX_SIZE: 60,
    FONT_SIZE: 30,
  },
  LARGE: {
    X: 1.7,
    Y: 1.7,
    WIDTH: 1.7,
    HEIGHT: 1.7,
    HEX_SIZE: 80,
    FONT_SIZE: 36,
  },
};
