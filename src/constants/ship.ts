import { ShipResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";
import { ShipType } from "../types/shipType";
import { IMAGES } from "./images";

export const SHIP_COST: Record<ShipType, Partial<Resources>> = {
  PROBE: { METAL: 1000, CRYSTAL: 500, ENERGY: 2000 },
  LIGHTFIGHTER: { METAL: 1000, CRYSTAL: 500, ENERGY: 1000 },
  INTERCEPTOR: { METAL: 2000, CRYSTAL: 1000, ENERGY: 2500 },
  ESCORTFRIGATE: { METAL: 5000, CRYSTAL: 25000, ENERGY: 500 },
  BATTLECRUISER: { METAL: 15000, CRYSTAL: 7000, ENERGY: 1500 },
  SPACEDESTROYER: { METAL: 40000, CRYSTAL: 20000, ENERGY: 4000 },
  ASSAULTBATTLESHIP: { METAL: 900000, CRYSTAL: 500000, ENERGY: 9000 },
  STARCARRIER: { METAL: 1800000, CRYSTAL: 1000000, ENERGY: 18000 },
  HEAVYASSAULTSHIP: { METAL: 1200000, CRYSTAL: 650000, ENERGY: 12000 },
  ORBITALASSAULTSHIP: { METAL: 1300000, CRYSTAL: 1200000, ENERGY: 25000 },
  PLANETARYDESTROYER: { METAL: 2000000, CRYSTAL: 2500000, ENERGY: 60000 },
  FREIGHTER: { METAL: 15000, CRYSTAL: 7000, ENERGY: 1500 },
};

export const SHIP_TIME: Record<ShipType, number> = {
  PROBE: 1000 * 60 * 1,
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
  FREIGHTER: 1000 * 60 * 3,
};

export const SHIP_REQUIRED_RESEARCH: Record<ShipType, ShipResearchRequiredData[]> = {
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
    { researchType: "ONTOCUANTICA", researchLevelRequired: 1 },
  ],
  ASSAULTBATTLESHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 3 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 2 },
    { researchType: "LASER", researchLevelRequired: 3 },
    { researchType: "SHIELD", researchLevelRequired: 2 },
    { researchType: "KELSIANO", researchLevelRequired: 1 },
  ],
  STARCARRIER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 4 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 2 },
    { researchType: "PLASMA", researchLevelRequired: 1 },
    { researchType: "SHIELD", researchLevelRequired: 2 },
    { researchType: "HEXOXIDO", researchLevelRequired: 1 },
  ],
  HEAVYASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 4 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 3 },
    { researchType: "PLASMA", researchLevelRequired: 2 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
    { researchType: "HEXOXIDO", researchLevelRequired: 1 },
    { researchType: "KELSIANO", researchLevelRequired: 1 },
  ],
  ORBITALASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 5 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 3 },
    { researchType: "PLASMA", researchLevelRequired: 3 },
    { researchType: "GRAVITY", researchLevelRequired: 1 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
    { researchType: "SELENOGRAFIA", researchLevelRequired: 1 },
    { researchType: "HEXOXIDO", researchLevelRequired: 1 },
  ],
  PLANETARYDESTROYER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 6 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 4 },
    { researchType: "PLASMA", researchLevelRequired: 3 },
    { researchType: "GRAVITY", researchLevelRequired: 2 },
    { researchType: "SHIELD", researchLevelRequired: 3 },
    { researchType: "SELENOGRAFIA", researchLevelRequired: 1 },
    { researchType: "FLUXION", researchLevelRequired: 1 },
  ],
  FREIGHTER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 1 },
    { researchType: "FUELREFINEMENT", researchLevelRequired: 1 },
  ],
};

export const SHIP_BACKGROUND_IMAGE: Record<ShipType, any> = {
  PROBE: IMAGES.SHIP_BG_PROBE,
  LIGHTFIGHTER: IMAGES.SHIP_BG_LIGHTFIGHTER,
  INTERCEPTOR: IMAGES.SHIP_BG_INTERCEPTOR,
  ESCORTFRIGATE: IMAGES.SHIP_BG_ESCORTFRIGATE,
  BATTLECRUISER: IMAGES.SHIP_BG_BATTLECRUISER,
  SPACEDESTROYER: IMAGES.SHIP_BG_SPACEDESTROYER,
  ASSAULTBATTLESHIP: IMAGES.SHIP_BG_ASSAULTBATTLESHIP,
  STARCARRIER: IMAGES.SHIP_BG_STARCARRIER,
  HEAVYASSAULTSHIP: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
  ORBITALASSAULTSHIP: IMAGES.SHIP_BG_ORBITALASSAULTSHIP,
  PLANETARYDESTROYER: IMAGES.SHIP_BG_PLANETARYDESTROYER,
  FREIGHTER: IMAGES.SHIP_BG_FREIGHTER,
};

export const SHIP_STATS: Record<ShipType, any> = {
  PROBE: {
    ATTACK: 0,
    DEFENSE: 1,
    SPEED: 1000,
    HP: 1,
  },
  LIGHTFIGHTER: {
    ATTACK: 1,
    DEFENSE: 2,
    SPEED: 100,
    HP: 2,
  },
  INTERCEPTOR: {
    ATTACK: 3,
    DEFENSE: 1,
    SPEED: 200,
    HP: 2,
  },
  ESCORTFRIGATE: {
    ATTACK: 3,
    DEFENSE: 3,
    SPEED: 300,
    HP: 3,
  },
  BATTLECRUISER: {
    ATTACK: 4,
    DEFENSE: 4,
    SPEED: 200,
    HP: 4,
  },
  SPACEDESTROYER: {
    ATTACK: 3,
    DEFENSE: 5,
    SPEED: 300,
    HP: 6,
  },
  ASSAULTBATTLESHIP: {
    ATTACK: 5,
    DEFENSE: 3,
    SPEED: 300,
    HP: 7,
  },
  STARCARRIER: {
    ATTACK: 6,
    DEFENSE: 5,
    SPEED: 300,
    HP: 6,
  },
  HEAVYASSAULTSHIP: {
    ATTACK: 7,
    DEFENSE: 6,
    SPEED: 250,
    HP: 7,
  },
  ORBITALASSAULTSHIP: {
    ATTACK: 7,
    DEFENSE: 8,
    SPEED: 150,
    HP: 10,
  },
  PLANETARYDESTROYER: {
    ATTACK: 10,
    DEFENSE: 8,
    SPEED: 100,
    HP: 30,
  },
  FREIGHTER: {
    ATTACK: 1,
    DEFENSE: 2,
    SPEED: 50,
    HP: 20,
  },
};
