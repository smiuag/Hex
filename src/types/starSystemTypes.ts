import { RaceType } from "./raceType";
import { CombinedResources, StoredResources } from "./resourceTypes";
import { ShipData } from "./shipType";

export type CelestialBodyType = "PLANET" | "ASTEROID" | "MOON" | "NEBULA_FRAGMENT";
export type StatusKey = "EXPLORED" | "DEFENDED" | "UNEXPLORED";

export type StarSystemType =
  | "BINARY"
  | "TRINARY"
  | "RED_DWARF"
  | "SUPERNOVA_REMNANT"
  | "DEAD_STAR"
  | "NEBULA";

export type PlanetType =
  | "VOLCANIC_PLANET"
  | "ICE_PLANET"
  | "GAS_GIANT"
  | "ROCKY_PLANET"
  | "TOXIC_PLANET";

export type CelestialBody = {
  type: CelestialBodyType;
  planetType?: PlanetType;
  production: CombinedResources;
  explored: boolean;
  baseBuilt: boolean;
  explorationStartedAt?: number;
  id: string;
};

export type StarSystem = {
  discarded: boolean;
  race?: RaceType;

  explorationStartedAt?: number;
  extractionStartedAt?: number;
  starPortStartedAt?: number;
  defenseStartedAt?: number;
  collectStartedAt?: number;
  attackStartedAt?: number;
  scanStartedAt?: number;

  starPortBuilt: boolean;
  extractionBuildingBuilt: boolean;
  defenseBuildingBuilt: boolean;

  type: StarSystemType;
  celestialBodies: CelestialBody[];
  discovered: boolean;
  conquered: boolean;
  explored: boolean;

  storedResources: StoredResources;

  distance: number;
  defense: ShipData[];
  playerShips: ShipData[];
  id: string;
};

export type StarSystemDetected = {
  id: string;
  name: string;
  cluster: string;
  galaxy: string;
  region: string;
  type: StarSystemType;
  cluster_index: number;
  galaxy_index: number;
  region_index: number;
  system_index: number;
};

export type StarSystemMap = {
  [systemId: string]: StarSystemDetected;
};

export interface UniverseNameMap {
  clusters: Record<string, string>;
  galaxies: Record<string, string>;
  regions: Record<string, string>;
}
