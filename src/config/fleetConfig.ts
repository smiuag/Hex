import { ImageSourcePropType } from "react-native";
import {
  FLEET_BACKGROUND_IMAGE,
  FLEET_COST,
  FLEET_REQUIRED_RESEARCH,
  FLEET_STATS,
  FLEET_TIME,
} from "../constants/fleet";
import { FleetType, ProductionFacilityType } from "../types/fleetType";
import { FleetResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";

export const fleetConfig: Record<
  FleetType,
  {
    baseBuildTime: number;
    imageBackground: ImageSourcePropType;
    baseCost: Partial<Resources>;
    requiredResearch: FleetResearchRequiredData[];
    orden: number;
    productionFacility: ProductionFacilityType;
    attack: number;
    defense: number;
    speed: number;
  }
> = {
  PROBE: {
    orden: 0,
    baseBuildTime: FLEET_TIME.PROBE,
    imageBackground: FLEET_BACKGROUND_IMAGE.PROBE,
    baseCost: FLEET_COST.PROBE,
    requiredResearch: FLEET_REQUIRED_RESEARCH.PROBE,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.PROBE.ATACK,
    defense: FLEET_STATS.PROBE.DEFENSE,
    speed: FLEET_STATS.PROBE.SPEED,
  },
  LIGHTFIGHTER: {
    orden: 1,
    baseBuildTime: FLEET_TIME.LIGHTFIGHTER,
    imageBackground: FLEET_BACKGROUND_IMAGE.LIGHTFIGHTER,
    baseCost: FLEET_COST.LIGHTFIGHTER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.LIGHTFIGHTER,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.LIGHTFIGHTER.ATACK,
    defense: FLEET_STATS.LIGHTFIGHTER.DEFENSE,
    speed: FLEET_STATS.LIGHTFIGHTER.SPEED,
  },
  INTERCEPTOR: {
    orden: 2,
    baseBuildTime: FLEET_TIME.INTERCEPTOR,
    imageBackground: FLEET_BACKGROUND_IMAGE.INTERCEPTOR,
    baseCost: FLEET_COST.INTERCEPTOR,
    requiredResearch: FLEET_REQUIRED_RESEARCH.INTERCEPTOR,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.INTERCEPTOR.ATACK,
    defense: FLEET_STATS.INTERCEPTOR.DEFENSE,
    speed: FLEET_STATS.INTERCEPTOR.SPEED,
  },
  ESCORTFRIGATE: {
    orden: 3,
    baseBuildTime: FLEET_TIME.ESCORTFRIGATE,
    imageBackground: FLEET_BACKGROUND_IMAGE.ESCORTFRIGATE,
    baseCost: FLEET_COST.ESCORTFRIGATE,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ESCORTFRIGATE,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.ESCORTFRIGATE.ATACK,
    defense: FLEET_STATS.ESCORTFRIGATE.DEFENSE,
    speed: FLEET_STATS.ESCORTFRIGATE.SPEED,
  },
  BATTLECRUISER: {
    orden: 4,
    baseBuildTime: FLEET_TIME.BATTLECRUISER,
    imageBackground: FLEET_BACKGROUND_IMAGE.BATTLECRUISER,
    baseCost: FLEET_COST.BATTLECRUISER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.BATTLECRUISER,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.BATTLECRUISER.ATACK,
    defense: FLEET_STATS.BATTLECRUISER.DEFENSE,
    speed: FLEET_STATS.BATTLECRUISER.SPEED,
  },
  SPACEDESTROYER: {
    orden: 5,
    baseBuildTime: FLEET_TIME.SPACEDESTROYER,
    imageBackground: FLEET_BACKGROUND_IMAGE.SPACEDESTROYER,
    baseCost: FLEET_COST.SPACEDESTROYER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.SPACEDESTROYER,
    productionFacility: "HANGAR",
    attack: FLEET_STATS.SPACEDESTROYER.ATACK,
    defense: FLEET_STATS.SPACEDESTROYER.DEFENSE,
    speed: FLEET_STATS.SPACEDESTROYER.SPEED,
  },
  ASSAULTBATTLESHIP: {
    orden: 6,
    baseBuildTime: FLEET_TIME.ASSAULTBATTLESHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.ASSAULTBATTLESHIP,
    baseCost: FLEET_COST.ASSAULTBATTLESHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ASSAULTBATTLESHIP,
    productionFacility: "SPACESTATION",
    attack: FLEET_STATS.ASSAULTBATTLESHIP.ATACK,
    defense: FLEET_STATS.ASSAULTBATTLESHIP.DEFENSE,
    speed: FLEET_STATS.ASSAULTBATTLESHIP.SPEED,
  },
  STARCARRIER: {
    orden: 7,
    baseBuildTime: FLEET_TIME.STARCARRIER,
    imageBackground: FLEET_BACKGROUND_IMAGE.STARCARRIER,
    baseCost: FLEET_COST.STARCARRIER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.STARCARRIER,
    productionFacility: "SPACESTATION",
    attack: FLEET_STATS.STARCARRIER.ATACK,
    defense: FLEET_STATS.STARCARRIER.DEFENSE,
    speed: FLEET_STATS.STARCARRIER.SPEED,
  },
  HEAVYASSAULTSHIP: {
    orden: 8,
    baseBuildTime: FLEET_TIME.HEAVYASSAULTSHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.HEAVYASSAULTSHIP,
    baseCost: FLEET_COST.HEAVYASSAULTSHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.HEAVYASSAULTSHIP,
    productionFacility: "SPACESTATION",
    attack: FLEET_STATS.HEAVYASSAULTSHIP.ATACK,
    defense: FLEET_STATS.HEAVYASSAULTSHIP.DEFENSE,
    speed: FLEET_STATS.HEAVYASSAULTSHIP.SPEED,
  },
  ORBITALASSAULTSHIP: {
    orden: 9,
    baseBuildTime: FLEET_TIME.ORBITALASSAULTSHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.ORBITALASSAULTSHIP,
    baseCost: FLEET_COST.ORBITALASSAULTSHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ORBITALASSAULTSHIP,
    productionFacility: "SPACESTATION",
    attack: FLEET_STATS.ORBITALASSAULTSHIP.ATACK,
    defense: FLEET_STATS.ORBITALASSAULTSHIP.DEFENSE,
    speed: FLEET_STATS.ORBITALASSAULTSHIP.SPEED,
  },
  PLANETARYDESTROYER: {
    orden: 10,
    baseBuildTime: FLEET_TIME.PLANETARYDESTROYER,
    imageBackground: FLEET_BACKGROUND_IMAGE.PLANETARYDESTROYER,
    baseCost: FLEET_COST.PLANETARYDESTROYER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.PLANETARYDESTROYER,
    productionFacility: "SPACESTATION",
    attack: FLEET_STATS.PLANETARYDESTROYER.ATACK,
    defense: FLEET_STATS.PLANETARYDESTROYER.DEFENSE,
    speed: FLEET_STATS.PLANETARYDESTROYER.SPEED,
  },
};
