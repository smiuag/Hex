import { ImageSourcePropType } from "react-native";
import { ResearchType } from "./researchTypes";
import { CombinedResources } from "./resourceTypes";
import { ShipType } from "./shipType";

export type ProcessType =
  | "BUILDING"
  | "RESEARCH"
  | "EXPLORATION SYSTEM FLEET"
  | "EXPLORATION PLANET FLEET"
  | "ATTACK FLEET"
  | "RETURN FLEET"
  | "MOVEMENT FLEET"
  | "SHIP"
  | "COLLECT";

export class Process {
  id: string;
  name: string;
  type: ProcessType;
  startedAt: number;
  duration: number;
  researchType?: ResearchType;
  image: ImageSourcePropType;
  shipType?: ShipType;
  explorationSystemId?: string;
  attackSystemId?: string;
  explorationPlanetId?: string;
  collectSystemId?: string;
  resources?: CombinedResources;
  q?: number;
  r?: number;

  constructor(
    id: string,
    name: string,
    type: ProcessType,
    researchType: ResearchType,
    startedAt: number,
    duration: number,
    image: ImageSourcePropType,
    shipType?: ShipType,
    explorationSystemId?: string,
    attackSystemId?: string,
    explorationPlanetId?: string,
    q?: number,
    r?: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.researchType = researchType;
    this.startedAt = startedAt;
    this.duration = duration;
    this.image = image;
    this.shipType = shipType;
    this.explorationSystemId = explorationSystemId;
    this.attackSystemId = attackSystemId;
    this.explorationPlanetId = explorationPlanetId;
    this.q = q;
    this.r = r;
  }
}
