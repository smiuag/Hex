import { BuildingType } from "../types/buildingTypes";
import { RequiredResearchs } from "../types/researchTypes";
import { IMAGES } from "./images";

export const BUILDING_COST = {
  LAB: { stone: 600, metal: 600, energy: 50 },
  KRYSTALMINE: { stone: 15000, metal: 10000, energy: 500 },
  METALLURGY: { stone: 7500, metal: 75000, energy: 300 },
  QUARRY: { stone: 5000, energy: 200 },
  BASE: { stone: 2000, metal: 500 },
};

export const BUILDING_PRODUCTION = {
  LAB: {},
  KRYSTALMINE: { crystal: 400 },
  METALLURGY: { metal: 500 },
  QUARRY: { stone: 600 },
  BASE: { stone: 100, metal: 100, energy: 50 },
};

export const BUILDING_TIME = {
  LAB: 1000 * 60 * 2,
  KRYSTALMINE: 1000 * 60 * 15,
  METALLURGY: 1000 * 60 * 5,
  QUARRY: 1000 * 60 * 2,
  BASE: 1000 * 60 * 30,
};

export const BUILDING_REQUIRED_RESEARCHS: Record<
  BuildingType,
  RequiredResearchs
> = {
  LAB: [{ type: "TERRAFORMING", level: 1 }],
  KRYSTALMINE: [{ type: "MINING", level: 1 }],
  METALLURGY: [{ type: "MINING", level: 1 }],
  QUARRY: [{ type: "MINING", level: 1 }],
  BASE: [{ type: "TERRAFORMING", level: 1 }],
};

export const BUILDING_IMAGES = {
  LAB: [
    { level: 1, image: IMAGES.BUILDING_LAB_1 },
    { level: 2, image: IMAGES.BUILDING_LAB_2 },
    { level: 3, image: IMAGES.BUILDING_LAB_3 },
    { level: 4, image: IMAGES.BUILDING_LAB_4 },
    { level: 5, image: IMAGES.BUILDING_LAB_5 },
  ],
  KRYSTALMINE: [
    { level: 1, image: IMAGES.BUILDING_MINING_1 },
    { level: 2, image: IMAGES.BUILDING_MINING_2 },
    { level: 3, image: IMAGES.BUILDING_MINING_3 },
    { level: 4, image: IMAGES.BUILDING_MINING_4 },
    { level: 5, image: IMAGES.BUILDING_MINING_5 },
  ],
  METALLURGY: [
    { level: 1, image: IMAGES.BUILDING_METAL_1 },
    { level: 2, image: IMAGES.BUILDING_METAL_2 },
    { level: 3, image: IMAGES.BUILDING_METAL_3 },
    { level: 4, image: IMAGES.BUILDING_METAL_4 },
    { level: 5, image: IMAGES.BUILDING_METAL_5 },
  ],
  QUARRY: [
    { level: 1, image: IMAGES.BUILDING_MINING_1 },
    { level: 2, image: IMAGES.BUILDING_MINING_2 },
    { level: 3, image: IMAGES.BUILDING_MINING_3 },
    { level: 4, image: IMAGES.BUILDING_MINING_4 },
    { level: 5, image: IMAGES.BUILDING_MINING_5 },
  ],
  BASE: [
    { level: 1, image: IMAGES.BUILDING_BASE_1 },
    { level: 2, image: IMAGES.BUILDING_BASE_2 },
    { level: 3, image: IMAGES.BUILDING_BASE_3 },
    { level: 4, image: IMAGES.BUILDING_BASE_4 },
    { level: 5, image: IMAGES.BUILDING_BASE_5 },
  ],
};
