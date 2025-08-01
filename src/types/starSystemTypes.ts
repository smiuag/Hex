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
  type: StarSystemType;
  planets: CelestialBody[];
  discovered: boolean;
  explored: boolean; // Si has mandado sonda
  conquered: boolean; // So has eliminado las defensas
  explorationFleetId?: string;
  attackStartedAt?: number;
  attackFleetId?: string;
  distance: number;
  starPort: boolean;
  starPortStartedAt?: number;
  defense: ShipData[];
  id: string;
};
