import { FleetType } from "../types/fleetType";
import { FleetResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";
import { IMAGES } from "./images";

export const FLEET_COST: Record<FleetType, Partial<Resources>> = {
  PROBE: { METAL: 1000, CRYSTAL: 500, ENERGY: 2000 },
  LIGHTFIGHTER: { METAL: 1000, CRYSTAL: 500, ENERGY: 1000 },
  INTERCEPTOR: { METAL: 2000, CRYSTAL: 1000, ENERGY: 2500 },
  ESCORTFRIGATE: { METAL: 5000, CRYSTAL: 25000, ENERGY: 500 },
  BATTLECRUISER: { METAL: 15000, CRYSTAL: 7000, ENERGY: 1500 },
  SPACEDESTROYER: { METAL: 40000, CRYSTAL: 20000, ENERGY: 4000 },
  ASSAULTBATTLESHIP: { METAL: 90000, CRYSTAL: 50000, ENERGY: 9000 },
  STARCARRIER: { METAL: 180000, CRYSTAL: 100000, ENERGY: 18000 },
  HEAVYASSAULTSHIP: { METAL: 120000, CRYSTAL: 65000, ENERGY: 12000 },
  ORBITALASSAULTSHIP: { METAL: 220000, CRYSTAL: 120000, ENERGY: 25000 },
  PLANETARYDESTROYER: { METAL: 500000, CRYSTAL: 250000, ENERGY: 60000 },
};

export const FLEET_TIME: Record<FleetType, number> = {
  PROBE: 1000 * 60 * 3,
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
  PROBE: [{ researchType: "SHIPENGINEERING", researchLevelRequired: 1 }],
  LIGHTFIGHTER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 1 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
  ],
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
  PROBE: IMAGES.FLEET_BG_PROBE,
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

export const FLEET_STATS: Record<FleetType, any> = {
  PROBE: {
    ATTACK: 0,
    DEFENSE: 1,
    SPEED: 1000,
  },
  LIGHTFIGHTER: {
    ATTACK: 1,
    DEFENSE: 2,
    SPEED: 100,
  },
  INTERCEPTOR: {
    ATTACK: 3,
    DEFENSE: 1,
    SPEED: 100,
  },
  ESCORTFRIGATE: {
    ATTACK: 3,
    DEFENSE: 3,
    SPEED: 300,
  },
  BATTLECRUISER: {
    ATTACK: 4,
    DEFENSE: 4,
    SPEED: 200,
  },
  SPACEDESTROYER: {
    ATTACK: 3,
    DEFENSE: 5,
    SPEED: 300,
  },
  ASSAULTBATTLESHIP: {
    ATTACK: 5,
    DEFENSE: 3,
    SPEED: 300,
  },
  STARCARRIER: {
    ATTACK: 5,
    DEFENSE: 5,
    SPEED: 300,
  },
  HEAVYASSAULTSHIP: {
    ATTACK: 6,
    DEFENSE: 6,
    SPEED: 250,
  },
  ORBITALASSAULTSHIP: {
    ATTACK: 7,
    DEFENSE: 9,
    SPEED: 150,
  },
  PLANETARYDESTROYER: {
    ATTACK: 10,
    DEFENSE: 10,
    SPEED: 100,
  },
};
