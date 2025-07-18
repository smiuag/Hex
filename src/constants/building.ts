export const BUILDING_COST = {
  LAB: { stone: 600, metal: 600, energy: 50 },
  KRYSTALMINE: { stone: 15000, metal: 10000, energy: 500 },
  METALLURGY: { stone: 7500, metal: 75000, energy: 300 },
  QUARRY: { stone: 5000, energy: 200 },
  BASE: { stone: 2000, metal: 500 },
};

export const BUILDING_PRODUCTION = {
  LAB: {},
  KRYSTALMINE: { crystal: 400 },
  METALLURGY: { metal: 500 },
  QUARRY: { stone: 600 },
  BASE: { stone: 100, metal: 100, energy: 50 },
};

export const BUILDING_TIME = {
  LAB: 1000 * 60 * 2,
  KRYSTALMINE: 1000 * 60 * 15,
  METALLURGY: 1000 * 60 * 5,
  QUARRY: 1000 * 60 * 2,
  BASE: 1000 * 60 * 30,
};
