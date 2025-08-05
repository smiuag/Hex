import { ResourceChance, ResourceType, SpecialResourceType } from "../types/resourceTypes";
import { CelestialBodyType, PlanetType, StarSystemType } from "../types/starSystemTypes";

export const starSystemConfig: Record<
  StarSystemType,
  {
    celestialProbabilities: Partial<Record<CelestialBodyType, number>>;
    bodyCounts: Partial<Record<CelestialBodyType, [number, number]>>;
    resourceProbabilities: Partial<Record<ResourceType | SpecialResourceType, number>>;
  }
> = {
  RED_DWARF: {
    celestialProbabilities: {
      PLANET: 0.8,
      ASTEROID: 0.5,
      MOON: 0.2,
      NEBULA_FRAGMENT: 0.1,
    },
    bodyCounts: {
      PLANET: [1, 4],
      ASTEROID: [1, 3],
      MOON: [0, 2],
      NEBULA_FRAGMENT: [0, 1],
    },
    resourceProbabilities: {
      METAL: 0.73,
      STONE: 0.69,
      ILMENITA: 0.15,
      AETHERIUM: 0.06,
      NEBULITA: 0.06,
    },
  },
  SUPERNOVA_REMNANT: {
    celestialProbabilities: {
      PLANET: 0.3,
      ASTEROID: 0.9,
      MOON: 0.2,
      NEBULA_FRAGMENT: 0.6,
    },
    bodyCounts: {
      PLANET: [0, 2],
      ASTEROID: [3, 6],
      MOON: [0, 1],
      NEBULA_FRAGMENT: [1, 3],
    },
    resourceProbabilities: {
      METAL: 0.69,
      STONE: 0.66,
      ILMENITA: 0.27,
      AETHERIUM: 0.06,
      NEBULITA: 0.36,
    },
  },
  BINARY: {
    celestialProbabilities: {
      PLANET: 0.9,
      ASTEROID: 0.4,
      MOON: 0.5,
      NEBULA_FRAGMENT: 0.2,
    },
    bodyCounts: {
      PLANET: [2, 5],
      ASTEROID: [1, 2],
      MOON: [1, 3],
      NEBULA_FRAGMENT: [0, 1],
    },
    resourceProbabilities: {
      METAL: 0.86,
      STONE: 0.79,
      ILMENITA: 0.12,
      AETHERIUM: 0.15,
      NEBULITA: 0.12,
    },
  },
  TRINARY: {
    celestialProbabilities: {
      PLANET: 0.7,
      ASTEROID: 0.6,
      MOON: 0.4,
      NEBULA_FRAGMENT: 0.3,
    },
    bodyCounts: {
      PLANET: [2, 4],
      ASTEROID: [2, 4],
      MOON: [0, 2],
      NEBULA_FRAGMENT: [0, 1],
    },
    resourceProbabilities: {
      METAL: 0.72,
      STONE: 0.68,
      ILMENITA: 0.18,
      AETHERIUM: 0.12,
      NEBULITA: 0.18,
    },
  },
  DEAD_STAR: {
    celestialProbabilities: {
      PLANET: 0.1,
      ASTEROID: 0.4,
      MOON: 0.1,
      NEBULA_FRAGMENT: 0.7,
    },
    bodyCounts: {
      PLANET: [0, 1],
      ASTEROID: [1, 3],
      MOON: [0, 1],
      NEBULA_FRAGMENT: [2, 4],
    },
    resourceProbabilities: {
      METAL: 0.29,
      STONE: 0.27,
      ILMENITA: 0.12,
      AETHERIUM: 0.03,
      NEBULITA: 0.42,
    },
  },
  NEBULA: {
    celestialProbabilities: {
      PLANET: 0.2,
      ASTEROID: 0.5,
      MOON: 0.2,
      NEBULA_FRAGMENT: 0.9,
    },
    bodyCounts: {
      PLANET: [0, 2],
      ASTEROID: [1, 3],
      MOON: [0, 1],
      NEBULA_FRAGMENT: [3, 6],
    },
    resourceProbabilities: {
      METAL: 0.43,
      STONE: 0.41,
      ILMENITA: 0.15,
      AETHERIUM: 0.06,
      NEBULITA: 0.54,
    },
  },
};

export const celestialResourceChances: Record<
  CelestialBodyType,
  {
    default: Partial<Record<ResourceType | SpecialResourceType, ResourceChance>>;
  } & Partial<
    Record<PlanetType, Partial<Record<ResourceType | SpecialResourceType, ResourceChance>>>
  >
> = {
  PLANET: {
    default: {
      METAL: [0.6, [2, 6]],
      STONE: [0.5, [1, 5]],
    },
    VOLCANIC_PLANET: {
      METAL: [0.9, [5, 10]],
      THARNIO: [0.5, [1, 3]],
    },
    ICE_PLANET: {
      KAIROX: [0.4, [1, 3]],
    },
    GAS_GIANT: {
      NEBULITA: [0.3, [1, 3]],
    },
    ROCKY_PLANET: {
      METAL: [0.7, [2, 7]],
      STONE: [0.6, [2, 6]],
    },
    TOXIC_PLANET: {
      CRYSTAL: [0.4, [2, 6]],
      KAIROX: [0.3, [1, 3]],
    },
  },
  ASTEROID: {
    default: {
      METAL: [0.5, [2, 6]],
      STONE: [0.5, [1, 5]],
      ILMENITA: [0.3, [1, 3]],
    },
  },
  MOON: {
    default: {
      STONE: [0.4, [1, 4]],
      AETHERIUM: [0.3, [1, 2]],
    },
  },
  NEBULA_FRAGMENT: {
    default: {
      NEBULITA: [0.6, [1, 3]],
    },
  },
};

export const starSystemTypeProbabilities: Record<StarSystemType, number> = {
  RED_DWARF: 0.35,
  BINARY: 0.2,
  TRINARY: 0.15,
  NEBULA: 0.12,
  SUPERNOVA_REMNANT: 0.1,
  DEAD_STAR: 0.08,
};
