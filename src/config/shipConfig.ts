import { ImageSourcePropType } from "react-native";
import {
  SHIP_BACKGROUND_IMAGE,
  SHIP_COST,
  SHIP_REQUIRED_RESEARCH,
  SHIP_STATS,
  SHIP_TIME,
} from "../constants/ship";
import { ShipResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";
import { ProductionFacilityType, ShipType } from "../types/shipType";

export const shipConfig: Record<
  ShipType,
  {
    baseBuildTime: number;
    imageBackground: ImageSourcePropType;
    baseCost: Partial<Resources>;
    requiredResearch: ShipResearchRequiredData[];
    orden: number;
    productionFacility: ProductionFacilityType;
    attack: number;
    defense: number;
    speed: number;
    hp: number;
  }
> = {
  PROBE: {
    orden: 0,
    baseBuildTime: SHIP_TIME.PROBE,
    imageBackground: SHIP_BACKGROUND_IMAGE.PROBE,
    baseCost: SHIP_COST.PROBE,
    requiredResearch: SHIP_REQUIRED_RESEARCH.PROBE,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.PROBE.ATTACK,
    defense: SHIP_STATS.PROBE.DEFENSE,
    speed: SHIP_STATS.PROBE.SPEED,
    hp: SHIP_STATS.PROBE.HP,
  },
  FREIGHTER: {
    orden: 1,
    baseBuildTime: SHIP_TIME.FREIGHTER,
    imageBackground: SHIP_BACKGROUND_IMAGE.FREIGHTER,
    baseCost: SHIP_COST.FREIGHTER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.FREIGHTER,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.FREIGHTER.ATTACK,
    defense: SHIP_STATS.FREIGHTER.DEFENSE,
    speed: SHIP_STATS.FREIGHTER.SPEED,
    hp: SHIP_STATS.FREIGHTER.HP,
  },
  LIGHTFIGHTER: {
    orden: 2,
    baseBuildTime: SHIP_TIME.LIGHTFIGHTER,
    imageBackground: SHIP_BACKGROUND_IMAGE.LIGHTFIGHTER,
    baseCost: SHIP_COST.LIGHTFIGHTER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.LIGHTFIGHTER,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.LIGHTFIGHTER.ATTACK,
    defense: SHIP_STATS.LIGHTFIGHTER.DEFENSE,
    speed: SHIP_STATS.LIGHTFIGHTER.SPEED,
    hp: SHIP_STATS.LIGHTFIGHTER.HP,
  },
  INTERCEPTOR: {
    orden: 3,
    baseBuildTime: SHIP_TIME.INTERCEPTOR,
    imageBackground: SHIP_BACKGROUND_IMAGE.INTERCEPTOR,
    baseCost: SHIP_COST.INTERCEPTOR,
    requiredResearch: SHIP_REQUIRED_RESEARCH.INTERCEPTOR,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.INTERCEPTOR.ATTACK,
    defense: SHIP_STATS.INTERCEPTOR.DEFENSE,
    speed: SHIP_STATS.INTERCEPTOR.SPEED,
    hp: SHIP_STATS.INTERCEPTOR.HP,
  },
  ESCORTFRIGATE: {
    orden: 4,
    baseBuildTime: SHIP_TIME.ESCORTFRIGATE,
    imageBackground: SHIP_BACKGROUND_IMAGE.ESCORTFRIGATE,
    baseCost: SHIP_COST.ESCORTFRIGATE,
    requiredResearch: SHIP_REQUIRED_RESEARCH.ESCORTFRIGATE,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.ESCORTFRIGATE.ATTACK,
    defense: SHIP_STATS.ESCORTFRIGATE.DEFENSE,
    speed: SHIP_STATS.ESCORTFRIGATE.SPEED,
    hp: SHIP_STATS.ESCORTFRIGATE.HP,
  },
  BATTLECRUISER: {
    orden: 5,
    baseBuildTime: SHIP_TIME.BATTLECRUISER,
    imageBackground: SHIP_BACKGROUND_IMAGE.BATTLECRUISER,
    baseCost: SHIP_COST.BATTLECRUISER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.BATTLECRUISER,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.BATTLECRUISER.ATTACK,
    defense: SHIP_STATS.BATTLECRUISER.DEFENSE,
    speed: SHIP_STATS.BATTLECRUISER.SPEED,
    hp: SHIP_STATS.BATTLECRUISER.HP,
  },
  SPACEDESTROYER: {
    orden: 6,
    baseBuildTime: SHIP_TIME.SPACEDESTROYER,
    imageBackground: SHIP_BACKGROUND_IMAGE.SPACEDESTROYER,
    baseCost: SHIP_COST.SPACEDESTROYER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.SPACEDESTROYER,
    productionFacility: "HANGAR",
    attack: SHIP_STATS.SPACEDESTROYER.ATTACK,
    defense: SHIP_STATS.SPACEDESTROYER.DEFENSE,
    speed: SHIP_STATS.SPACEDESTROYER.SPEED,
    hp: SHIP_STATS.SPACEDESTROYER.HP,
  },
  ASSAULTBATTLESHIP: {
    orden: 7,
    baseBuildTime: SHIP_TIME.ASSAULTBATTLESHIP,
    imageBackground: SHIP_BACKGROUND_IMAGE.ASSAULTBATTLESHIP,
    baseCost: SHIP_COST.ASSAULTBATTLESHIP,
    requiredResearch: SHIP_REQUIRED_RESEARCH.ASSAULTBATTLESHIP,
    productionFacility: "SPACESTATION",
    attack: SHIP_STATS.ASSAULTBATTLESHIP.ATTACK,
    defense: SHIP_STATS.ASSAULTBATTLESHIP.DEFENSE,
    speed: SHIP_STATS.ASSAULTBATTLESHIP.SPEED,
    hp: SHIP_STATS.ASSAULTBATTLESHIP.HP,
  },
  STARCARRIER: {
    orden: 8,
    baseBuildTime: SHIP_TIME.STARCARRIER,
    imageBackground: SHIP_BACKGROUND_IMAGE.STARCARRIER,
    baseCost: SHIP_COST.STARCARRIER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.STARCARRIER,
    productionFacility: "SPACESTATION",
    attack: SHIP_STATS.STARCARRIER.ATTACK,
    defense: SHIP_STATS.STARCARRIER.DEFENSE,
    speed: SHIP_STATS.STARCARRIER.SPEED,
    hp: SHIP_STATS.STARCARRIER.HP,
  },
  HEAVYASSAULTSHIP: {
    orden: 9,
    baseBuildTime: SHIP_TIME.HEAVYASSAULTSHIP,
    imageBackground: SHIP_BACKGROUND_IMAGE.HEAVYASSAULTSHIP,
    baseCost: SHIP_COST.HEAVYASSAULTSHIP,
    requiredResearch: SHIP_REQUIRED_RESEARCH.HEAVYASSAULTSHIP,
    productionFacility: "SPACESTATION",
    attack: SHIP_STATS.HEAVYASSAULTSHIP.ATTACK,
    defense: SHIP_STATS.HEAVYASSAULTSHIP.DEFENSE,
    speed: SHIP_STATS.HEAVYASSAULTSHIP.SPEED,
    hp: SHIP_STATS.HEAVYASSAULTSHIP.HP,
  },
  ORBITALASSAULTSHIP: {
    orden: 10,
    baseBuildTime: SHIP_TIME.ORBITALASSAULTSHIP,
    imageBackground: SHIP_BACKGROUND_IMAGE.ORBITALASSAULTSHIP,
    baseCost: SHIP_COST.ORBITALASSAULTSHIP,
    requiredResearch: SHIP_REQUIRED_RESEARCH.ORBITALASSAULTSHIP,
    productionFacility: "SPACESTATION",
    attack: SHIP_STATS.ORBITALASSAULTSHIP.ATTACK,
    defense: SHIP_STATS.ORBITALASSAULTSHIP.DEFENSE,
    speed: SHIP_STATS.ORBITALASSAULTSHIP.SPEED,
    hp: SHIP_STATS.ORBITALASSAULTSHIP.HP,
  },
  PLANETARYDESTROYER: {
    orden: 11,
    baseBuildTime: SHIP_TIME.PLANETARYDESTROYER,
    imageBackground: SHIP_BACKGROUND_IMAGE.PLANETARYDESTROYER,
    baseCost: SHIP_COST.PLANETARYDESTROYER,
    requiredResearch: SHIP_REQUIRED_RESEARCH.PLANETARYDESTROYER,
    productionFacility: "SPACESTATION",
    attack: SHIP_STATS.PLANETARYDESTROYER.ATTACK,
    defense: SHIP_STATS.PLANETARYDESTROYER.DEFENSE,
    speed: SHIP_STATS.PLANETARYDESTROYER.SPEED,
    hp: SHIP_STATS.PLANETARYDESTROYER.HP,
  },
};
