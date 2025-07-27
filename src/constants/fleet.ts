import { FleetType } from "../types/fleetType";
import { FleetResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";
import { IMAGES } from "./images";

export const FLEET_COST: Record<FleetType, Partial<Resources>> = {
  LIGHTFIGHTER: { METAL: 100, CRYSTAL: 50, ENERGY: 10 },
  INTERCEPTOR: { METAL: 200, CRYSTAL: 100, ENERGY: 25 },
  ESCORTFRIGATE: { METAL: 500, CRYSTAL: 250, ENERGY: 50 },
  BATTLECRUISER: { METAL: 1500, CRYSTAL: 700, ENERGY: 150 },
  SPACEDESTROYER: { METAL: 4000, CRYSTAL: 2000, ENERGY: 400 },
  ASSAULTBATTLESHIP: { METAL: 9000, CRYSTAL: 5000, ENERGY: 900 },
  STARCARRIER: { METAL: 18000, CRYSTAL: 10000, ENERGY: 1800 },
  HEAVYASSAULTSHIP: { METAL: 12000, CRYSTAL: 6500, ENERGY: 1200 },
  ORBITALASSAULTSHIP: { METAL: 22000, CRYSTAL: 12000, ENERGY: 2500 },
  PLANETARYDESTROYER: { METAL: 50000, CRYSTAL: 25000, ENERGY: 6000 },
};

export const FLEET_TIME: Record<FleetType, number> = {
  LIGHTFIGHTER: 1000 * 60 * 3,
  INTERCEPTOR: 1000 * 60 * 4,
  ESCORTFRIGATE: 1000 * 60 * 15,
  BATTLECRUISER: 1000 * 60 * 25,
  SPACEDESTROYER: 1000 * 60 * 60,
  ASSAULTBATTLESHIP: 1000 * 60 * 60 * 2,
  STARCARRIER: 1000 * 60 * 60 * 5,
  HEAVYASSAULTSHIP: 1000 * 60 * 60 * 12,
  ORBITALASSAULTSHIP: 1000 * 60 * 60 * 24,
  PLANETARYDESTROYER: 1000 * 60 * 60 * 24 * 2,
};

export const FLEET_REQUIRED_RESEARCH: Record<FleetType, FleetResearchRequiredData[]> = {
  LIGHTFIGHTER: [{ researchType: "SHIPENGINEERING", researchLevelRequired: 1 }],
  INTERCEPTOR: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 1 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
  ],
  ESCORTFRIGATE: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 2 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
  ],
  BATTLECRUISER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 2 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
    { researchType: "LASER", researchLevelRequired: 1 },
  ],
  SPACEDESTROYER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 3 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
    { researchType: "LASER", researchLevelRequired: 2 },
    { researchType: "SHIELD", researchLevelRequired: 1 },
  ],
  ASSAULTBATTLESHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 3 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 2 },
    { researchType: "LASER", researchLevelRequired: 3 },
    { researchType: "SHIELD", researchLevelRequired: 2 },
  ],
  STARCARRIER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 4 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 2 },
    { researchType: "PLASMA", researchLevelRequired: 1 },
    { researchType: "SHIELD", researchLevelRequired: 2 },
  ],
  HEAVYASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 4 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 3 },
    { researchType: "PLASMA", researchLevelRequired: 2 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
  ],
  ORBITALASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 5 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 3 },
    { researchType: "PLASMA", researchLevelRequired: 3 },
    { researchType: "GRAVITY", researchLevelRequired: 1 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
  ],
  PLANETARYDESTROYER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 6 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 4 },
    { researchType: "PLASMA", researchLevelRequired: 3 },
    { researchType: "GRAVITY", researchLevelRequired: 2 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
  ],
};

export const FLEET_BACKGROUND_IMAGE: Record<FleetType, any> = {
  LIGHTFIGHTER: IMAGES.FLEET_BG_LIGHTFIGHTER,
  INTERCEPTOR: IMAGES.FLEET_BG_INTERCEPTOR,
  ESCORTFRIGATE: IMAGES.FLEET_BG_ESCORTFRIGATE,
  BATTLECRUISER: IMAGES.FLEET_BG_BATTLECRUISER,
  SPACEDESTROYER: IMAGES.FLEET_BG_SPACEDESTROYER,
  ASSAULTBATTLESHIP: IMAGES.FLEET_BG_ASSAULTBATTLESHIP,
  STARCARRIER: IMAGES.FLEET_BG_STARCARRIER,
  HEAVYASSAULTSHIP: IMAGES.FLEET_BG_HEAVYASSAULTSHIP,
  ORBITALASSAULTSHIP: IMAGES.FLEET_BG_ORBITALASSAULTSHIP,
  PLANETARYDESTROYER: IMAGES.FLEET_BG_PLANETARYDESTROYER,
};
