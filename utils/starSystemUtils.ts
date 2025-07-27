import uuid from "react-native-uuid";
import { IMAGES } from "../src/constants/images";
import { celestialResourceChances, starSystemConfig } from "../src/constants/starSystem";
import {
  Resources,
  ResourceType,
  SpecialResources,
  SpecialResourceType,
} from "../src/types/resourceTypes";
import {
  CelestialBody,
  CelestialBodyType,
  PlanetType,
  StarSystem,
  StarSystemType,
} from "../src/types/starSystemTypes";

function getRandomFromRange([min, max]: [number, number]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shouldInclude(probability: number): boolean {
  return Math.random() < probability;
}

function generateResources(
  bodyType: CelestialBodyType,
  planetType?: PlanetType
): { resources: Partial<Resources | SpecialResources> } {
  const base = celestialResourceChances[bodyType];
  const config = planetType && base[planetType] ? base[planetType]! : base.default;
  const resources: Partial<Resources> = {};

  Object.entries(config).forEach(([resType, [chance, range]]) => {
    if (shouldInclude(chance)) {
      const amount = getRandomFromRange(range);
      resources[resType as ResourceType] = amount;
    }
  });

  return { resources };
}

function generateCelestialBody(type: CelestialBodyType): CelestialBody {
  let planetType: PlanetType | undefined;
  if (type === "PLANET") {
    planetType = pickRandom([
      "VOLCANIC_PLANET",
      "ICE_PLANET",
      "GAS_GIANT",
      "ROCKY_PLANET",
      "TOXIC_PLANET",
    ]);
  }

  const { resources } = generateResources(type, planetType);

  return {
    type,
    planetType,
    resources,
    explored: false,
    baseBuilt: false,
  };
}

export function generateStarSystem(type: StarSystemType): StarSystem {
  const config = starSystemConfig[type];
  const celestialBodies: CelestialBody[] = [];
  const distance = getRandomFromRange([1, 1000]);

  Object.entries(config.bodyCounts).forEach(([bodyTypeKey, range]) => {
    const bodyType = bodyTypeKey as CelestialBodyType;
    const prob = config.celestialProbabilities[bodyType] ?? 0;
    if (!shouldInclude(prob)) return;

    const count = getRandomFromRange(range);
    for (let i = 0; i < count; i++) {
      celestialBodies.push(generateCelestialBody(bodyType));
    }
  });

  const id = uuid.v4();

  return {
    type,
    planets: celestialBodies,
    discovered: false,
    image: IMAGES[type],
    explored: false,
    conquered: false,
    lastUpdate: Date.now(),
    name: type.replace("_", " "),
    distance,
    id: id,
  };
}

export function getExpectedResourceProbabilities(
  systemType: StarSystemType
): Partial<Record<ResourceType | SpecialResourceType, number>> {
  return starSystemConfig[systemType]?.resourceProbabilities ?? {};
}
