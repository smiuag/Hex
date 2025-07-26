import { ImageSourcePropType } from "react-native";
import { FleetType } from "./fleetType";
import { ResearchType } from "./researchTypes";

export type ProcessType = "BUILDING" | "RESEARCH" | "SHIP";

export class Process {
  id: string;
  name: string;
  type: ProcessType;
  startedAt: number;
  duration: number;
  researchType?: ResearchType;
  image: ImageSourcePropType;
  fleetType?: FleetType;
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
