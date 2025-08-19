import { IMAGES } from "@/src/constants/images";
import { celestialResourceChances, starSystemConfig } from "@/src/constants/starSystem";
import { DiplomacyLevel } from "@/src/types/raceType";
import { CombinedResources, ResourceType, SpecialResourceType } from "@/src/types/resourceTypes";
import { ALL_SHIP_TYPES, ShipData } from "@/src/types/shipType";
import {
  CelestialBody,
  CelestialBodyType,
  PlanetType,
  StarSystem,
  StarSystemDetected,
  StarSystemMap,
  StarSystemType,
} from "@/src/types/starSystemTypes";
import { ImageSourcePropType } from "react-native";
import uuid from "react-native-uuid";
import { getRandomRace } from "./eventUtil";
import { makeShip } from "./shipUtils";

function getRandomFromRange([min, max]: [number, number]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shouldInclude(probability: number): boolean {
  return Math.random() < probability;
}

function getLogBiasedRandom(min: number, max: number): number {
  const u = Math.random(); // valor uniforme entre 0 y 1
  const biased = Math.log10(9 * u + 1); // transformación logarítmica suave

  const scaled = min + (max - min) * biased; // escala al rango [min, max]
  return Math.round(scaled);
}

function generateProduction(
  bodyType: CelestialBodyType,
  planetType?: PlanetType
): CombinedResources {
  const base = celestialResourceChances[bodyType];
  const config = planetType && base[planetType] ? base[planetType]! : base.default;
  const production: CombinedResources = {};

  Object.entries(config).forEach(([resType, [chance, range]]) => {
    if (shouldInclude(chance)) {
      const amount = getRandomFromRange(range);
      production[resType as ResourceType] = amount;
    }
  });

  return production;
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

  const production = generateProduction(type, planetType);
  const id = uuid.v4();

  return {
    type,
    planetType,
    production,
    explored: false,
    baseBuilt: false,
    id: id,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateStarSystemDefense(decay: number): ShipData[] {
  const maxShipTypes = getRandomFromRange([2, 6]);
  if (decay > 0.8) decay = 0.8;
  const selectedShips = shuffleArray(ALL_SHIP_TYPES).slice(0, maxShipTypes);
  const defense: ShipData[] = [];

  for (const ship of selectedShips) {
    let count = 0;
    let chance = 1.0;

    do {
      count++;
      chance *= decay;
    } while (Math.random() < chance);

    defense.push(makeShip(ship, count));
  }

  return defense;
}

export function getSystemImage(type: StarSystemType): ImageSourcePropType {
  return IMAGES[type];
}

export function getExpectedResourceProbabilities(
  systemType: StarSystemType,
  stelarBodys: number
): Partial<Record<ResourceType | SpecialResourceType, number>> {
  const base = starSystemConfig[systemType]?.resourceProbabilities ?? {};
  const multiplier = Math.log(stelarBodys + 1) / Math.log(2);
  const adjusted: Partial<Record<ResourceType | SpecialResourceType, number>> = {};

  for (const key in base) {
    const typedKey = key as ResourceType | SpecialResourceType;
    const baseProb = base[typedKey] ?? 0;
    adjusted[typedKey] = Math.min(baseProb * multiplier, 0.99);
  }

  return adjusted;
}

function parseSystemId(id: string) {
  const match = id.match(/^c(\d+)-g(\d+)-r(\d+)-s(\d+)$/);
  if (!match) throw new Error("Invalid system ID format: " + id);
  const [, cluster, galaxy, region, system] = match.map(Number);
  return { cluster, galaxy, region, system };
}

export function getDistance(currentSystemId: string, targetSystemId: string): number {
  const current = parseSystemId(currentSystemId);
  const target = parseSystemId(targetSystemId);

  if (currentSystemId === targetSystemId) {
    return 0; // misma ubicación exacta
  }

  if (
    current.cluster === target.cluster &&
    current.galaxy === target.galaxy &&
    current.region === target.region
  ) {
    return getLogBiasedRandom(30, 3000);
  }

  if (current.cluster === target.cluster && current.galaxy === target.galaxy) {
    return getLogBiasedRandom(2000, 10000);
  }

  return getLogBiasedRandom(3500, 35000);
}

export const generateSystem = (
  currentSystemId: string,
  system: StarSystemDetected,
  playerDiplomacy: DiplomacyLevel[]
): StarSystem => {
  const type = system.type;

  const config = starSystemConfig[type];
  const celestialBodies: CelestialBody[] = [];

  let numCelestialBodies = 0;
  Object.entries(config.bodyCounts).forEach(([bodyTypeKey, range]) => {
    const bodyType = bodyTypeKey as CelestialBodyType;
    const prob = config.celestialProbabilities[bodyType] ?? 0;
    if (!shouldInclude(prob)) return;

    numCelestialBodies = getRandomFromRange(range);

    for (let i = 0; i < numCelestialBodies; i++) {
      celestialBodies.push(generateCelestialBody(bodyType));
    }
  });

  const decay = 1 - 0.1 * numCelestialBodies;
  const starPort = shouldInclude(0.2 + 0.1 * numCelestialBodies);
  const defenseShip = starPort ? generateStarSystemDefense(decay) : [];
  const distance = getDistance(currentSystemId, system.id);
  const race = starPort ? getRandomRace() : undefined;

  return {
    type,
    race: race,
    celestialBodies: celestialBodies,
    discovered: false,
    explored: false,
    conquered: false,
    storedResources: { production: {}, resources: {}, lastUpdate: Date.now() },
    distance,
    starPortBuilt: starPort,
    defenseBuildingBuilt: false,
    extractionBuildingBuilt: false,
    discarded: false,
    defense: defenseShip,
    id: system.id,
  };
};

export function getRandomStartSystem(universe: StarSystemMap): StarSystemDetected {
  const systems = Object.values(universe);

  if (systems.length === 0) {
    throw new Error("El universo está vacío. No hay sistemas disponibles.");
  }

  const randomIndex = Math.floor(Math.random() * systems.length);
  return systems[randomIndex];
}

export function getGalaxiesFromCluster(universe: StarSystemMap, cluster: string): string[] {
  const galaxies = new Set<string>();
  for (const system of Object.values(universe)) {
    if (system.cluster === cluster) {
      galaxies.add(system.galaxy);
    }
  }
  return Array.from(galaxies);
}

export function getRegionsFromGalaxy(
  universe: StarSystemMap,
  cluster: string,
  galaxy: string
): string[] {
  const regions = new Set<string>();
  for (const system of Object.values(universe)) {
    if (system.cluster === cluster && system.galaxy === galaxy) {
      regions.add(system.region);
    }
  }
  return Array.from(regions);
}

export function getSystemsFromRegion(
  universe: StarSystemMap,
  cluster: string,
  galaxy: string,
  region: string
): StarSystemDetected[] {
  return Object.values(universe).filter(
    (s) => s.cluster === cluster && s.galaxy === galaxy && s.region === region
  );
}
