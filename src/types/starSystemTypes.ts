import { Resources, SpecialResources } from "./resourceTypes";
import { ShipData } from "./shipType";

export type CelestialBodyType = "PLANET" | "ASTEROID" | "MOON" | "NEBULA_FRAGMENT";

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
  resources: Partial<Resources | SpecialResources>;
  explored: boolean;
  baseBuilt: boolean;
  id: string;
  explorationFleetId?: string;
};

export type StarSystem = {
  discarded: boolean;

  extractionBuildingBuilt: boolean;
  extractionStartedAt?: number;

  starPortBuilt: boolean;
  starPortStartedAt?: number;

  defenseBuildingBuilt: boolean;
  defenseStartedAt?: number;

  scanStartedAt?: number;
  type: StarSystemType;
  planets: CelestialBody[];
  discovered: boolean;
  conquered: boolean;

  explored: boolean;
  explorationFleetId?: string;

  attackStartedAt?: number;
  attackFleetId?: string;

  distance: number;
  defense: ShipData[];
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
