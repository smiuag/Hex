import { ImageSourcePropType } from "react-native";
import { ResearchType } from "./researchTypes";
import { ShipType } from "./shipType";

export type ProcessType = "BUILDING" | "RESEARCH" | "SHIP" | "FLEET";

export class Process {
  id: string;
  name: string;
  type: ProcessType;
  startedAt: number;
  duration: number;
  researchType?: ResearchType;
  image: ImageSourcePropType;
  shipType?: ShipType;
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
    this.q = q;
    this.r = r;
  }
}
