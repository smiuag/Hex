export const RESEARCH_COST = {
  TERRAFORMING: { stone: 10000, metal: 10000, energy: 5000 },
  MINING: { stone: 5000, metal: 5000, energy: 1000 },
  WATERPURIFICATION: { stone: 1500, metal: 1500, energy: 100 },
  FUELREFINEMENT: { stone: 5000, metal: 3000, energy: 200 },
  ENERGYEFFICIENCY: { stone: 2000, metal: 1000, energy: 500 },
  SHIPENGINEERING: { crystal: 3000, metal: 20000, energy: 10000 },
  LASER: { crystal: 3000, metal: 20000, energy: 10000 },
  PLASMA: { crystal: 3000, metal: 15000, energy: 15000 },
  SHIELD: { crystal: 6000, metal: 20000, energy: 15000 },
  GRAVITY: { crystal: 30000, metal: 20000, energy: 20000 },
};

export const RESEARCH_TIME = {
  TERRAFORMING: 1000 * 60 * 1.5,
  MINING: 1000 * 60,
  WATERPURIFICATION: 1000 * 60 * 60 * 2,
  FUELREFINEMENT: 1000 * 60 * 60 * 12,
  ENERGYEFFICIENCY: 1000 * 60 * 60 * 12,
  SHIPENGINEERING: 1000 * 60 * 60 * 24 * 1.5,
  LASER: 1000 * 60 * 60 * 12,
  PLASMA: 1000 * 60 * 60 * 24,
  SHIELD: 1000 * 60 * 60 * 24,
  GRAVITY: 1000 * 60 * 60 * 24 * 7,
};

export const LAB_LVL_REQUIRED = {
  TERRAFORMING: 1,
  MINING: 1,
  WATERPURIFICATION: 2,
  FUELREFINEMENT: 2,
  ENERGYEFFICIENCY: 3,
  SHIPENGINEERING: 1,
  LASER: 2,
  PLASMA: 3,
  SHIELD: 3,
  GRAVITY: 4,
};

export const MAX_LVL = {
  TERRAFORMING: 3,
  MINING: 4,
  WATERPURIFICATION: 3,
  FUELREFINEMENT: 3,
  ENERGYEFFICIENCY: 3,
  SHIPENGINEERING: 5,
  LASER: 3,
  PLASMA: 3,
  SHIELD: 3,
  GRAVITY: 2,
};
