import { FleetType } from "../types/fleetType";
import { FleetResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";
import { IMAGES } from "./images";

export const FLEET_COST: Record<FleetType, Partial<Resources>> = {
  LIGHTFIGHTER: { metal: 100, crystal: 50, energy: 10 },
  INTERCEPTOR: { metal: 200, crystal: 100, energy: 25 },
  ESCORTFRIGATE: { metal: 500, crystal: 250, energy: 50 },
  BATTLECRUISER: { metal: 1500, crystal: 700, energy: 150 },
  SPACEDESTROYER: { metal: 4000, crystal: 2000, energy: 400 },
  ASSAULTBATTLESHIP: { metal: 9000, crystal: 5000, energy: 900 },
  STARCARRIER: { metal: 18000, crystal: 10000, energy: 1800 },
  HEAVYASSAULTSHIP: { metal: 12000, crystal: 6500, energy: 1200 },
  ORBITALASSAULTSHIP: { metal: 22000, crystal: 12000, energy: 2500 },
  PLANETARYDESTROYER: { metal: 50000, crystal: 25000, energy: 6000 },
};

export const FLEET_TIME: Record<FleetType, number> = {
  LIGHTFIGHTER: 1000 * 30,
  INTERCEPTOR: 1000 * 45,
  ESCORTFRIGATE: 1000 * 90,
  BATTLECRUISER: 1000 * 180,
  SPACEDESTROYER: 1000 * 300,
  ASSAULTBATTLESHIP: 1000 * 600,
  STARCARRIER: 1000 * 1200,
  HEAVYASSAULTSHIP: 1000 * 900,
  ORBITALASSAULTSHIP: 1000 * 1500,
  PLANETARYDESTROYER: 1000 * 3600,
};

export const FLEET_REQUIRED_RESEARCH: Record<
  FleetType,
  FleetResearchRequiredData[]
> = {
  LIGHTFIGHTER: [{ researchType: "SHIPENGINEERING", researchLevelRequired: 1 }],
  INTERCEPTOR: [{ researchType: "SHIPENGINEERING", researchLevelRequired: 1 }],
  ESCORTFRIGATE: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 2 },
  ],
  BATTLECRUISER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 2 },
  ],
  SPACEDESTROYER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 3 },
  ],
  ASSAULTBATTLESHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 3 },
  ],
  STARCARRIER: [{ researchType: "SHIPENGINEERING", researchLevelRequired: 4 }],
  HEAVYASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 4 },
  ],
  ORBITALASSAULTSHIP: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 5 },
  ],
  PLANETARYDESTROYER: [
    { researchType: "SHIPENGINEERING", researchLevelRequired: 6 },
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
