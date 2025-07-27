import { ImageSourcePropType } from "react-native";
import { Resources, SpecialResources } from "./resourceTypes";

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
};

export type StarSystem = {
  image: ImageSourcePropType;
  type: StarSystemType;
  planets: CelestialBody[];
  discovered: boolean;
  explored: boolean;
  conquered: boolean;
  lastUpdate: number;
  distance: number;
  id: string;
};
