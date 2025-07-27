import uuid from "react-native-uuid";
import { IMAGES } from "../src/constants/images";
import { celestialResourceChances, starSystemConfig } from "../src/constants/starSystem";
import { ALL_FLEET_TYPES, FleetData, FleetType } from "../src/types/fleetType";
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
function getBiasedRandom(min: number, max: number, mean: number, stddev: number): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // evita log(0)
  while (v === 0) v = Math.random();
  const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  const value = Math.round(standardNormal * stddev + mean);
  return Math.max(min, Math.min(max, value)); // recorta a [min, max]
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
  const id = uuid.v4();

  return {
    type,
    planetType,
    resources,
    explored: false,
    baseBuilt: false,
    id: id,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function generatePlanetDefense(decay: number): FleetData[] {
  const maxShipTypes = getRandomFromRange([2, 6]);
  if (decay > 0.8) decay = 0.8;
  const selectedShips = shuffleArray(ALL_FLEET_TYPES).slice(0, maxShipTypes);
  const defense: FleetData[] = [];

  for (const ship of selectedShips) {
    let count = 0;
    let chance = 1.0;

    do {
      count++;
      chance *= decay;
    } while (Math.random() < chance);

    defense.push({ type: ship as FleetType, amount: count });
  }

  return defense;
}

export function generateStarSystem(type: StarSystemType): StarSystem {
  const config = starSystemConfig[type];
  const celestialBodies: CelestialBody[] = [];
  const distance = getBiasedRandom(30, 3000, 1500, 500);

  let numPlanets = 0;
  Object.entries(config.bodyCounts).forEach(([bodyTypeKey, range]) => {
    const bodyType = bodyTypeKey as CelestialBodyType;
    const prob = config.celestialProbabilities[bodyType] ?? 0;
    if (!shouldInclude(prob)) return;

    numPlanets = getRandomFromRange(range);

    for (let i = 0; i < numPlanets; i++) {
      celestialBodies.push(generateCelestialBody(bodyType));
    }
  });

  const decay = 1 - 0.1 * numPlanets;
  const starPort = shouldInclude(0.1 * numPlanets);
  const defenseFleet = starPort ? generatePlanetDefense(decay) : [];

  const id = uuid.v4();

  return {
    type,
    planets: celestialBodies,
    discovered: false,
    image: IMAGES[type],
    explored: false,
    conquered: !starPort,
    distance,
    starPort: starPort,
    defense: defenseFleet,
    id: id,
  };
}

export function getExpectedResourceProbabilities(
  systemType: StarSystemType
): Partial<Record<ResourceType | SpecialResourceType, number>> {
  return starSystemConfig[systemType]?.resourceProbabilities ?? {};
}
