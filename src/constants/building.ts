import { BuildingType } from "../types/buildingTypes";
import { RequiredResearchs } from "../types/researchTypes";
import { IMAGES } from "./images";

export const BUILDING_COST = {
  LAB: { stone: 600, metal: 600, energy: 50 },
  KRYSTALMINE: { stone: 15000, metal: 10000, energy: 500 },
  METALLURGY: { stone: 7500, metal: 75000, energy: 300 },
  QUARRY: { stone: 5000, energy: 200 },
  BASE: { stone: 2000, metal: 500 },
  ANTENNA: { stone: 75000, metal: 35000, crystal: 7500, energy: 300 },
  ROCKET: { stone: 150000, metal: 150000, crystal: 5000, energy: 300 },
  HANGAR: { stone: 150000, metal: 150000, crystal: 5000, energy: 300 },
};

export const BUILDING_PRODUCTION = {
  LAB: {},
  KRYSTALMINE: { crystal: 400 },
  METALLURGY: { metal: 500 },
  QUARRY: { stone: 600 },
  BASE: { stone: 100, metal: 100, energy: 50 },
  ANTENNA: {},
  ROCKET: {},
  HANGAR: {},
};

export const BUILDING_TIME = {
  LAB: 1000 * 60 * 2,
  KRYSTALMINE: 1000 * 60 * 15,
  METALLURGY: 1000 * 60 * 5,
  QUARRY: 1000 * 60 * 2,
  BASE: 1000 * 60 * 30,
  ANTENNA: 1000 * 60 * 60,
  ROCKET: 1000 * 60 * 60 * 12,
  HANGAR: 1000 * 60 * 60 * 6,
};

export const BUILDING_MAX_IN_PLANET = {
  LAB: 1,
  KRYSTALMINE: 3,
  METALLURGY: 7,
  QUARRY: 7,
  BASE: 1,
  ANTENNA: 1,
  ROCKET: 3,
  HANGAR: 5,
};

export const BUILDING_REQUIRED_RESEARCHS: Record<
  BuildingType,
  RequiredResearchs
> = {
  LAB: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
  ],
  KRYSTALMINE: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
  ],
  METALLURGY: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
  ],
  QUARRY: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
  ],
  BASE: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 2,
    },
  ],
  ANTENNA: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
  ],
  ROCKET: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
  ],
  HANGAR: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
  ],
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
  ANTENNA: [
    { level: 1, image: IMAGES.BUILDING_MINING_1 },
    { level: 2, image: IMAGES.BUILDING_MINING_2 },
    { level: 3, image: IMAGES.BUILDING_MINING_3 },
    { level: 4, image: IMAGES.BUILDING_MINING_4 },
    { level: 5, image: IMAGES.BUILDING_MINING_5 },
  ],
  ROCKET: [
    { level: 1, image: IMAGES.BUILDING_MINING_1 },
    { level: 2, image: IMAGES.BUILDING_MINING_2 },
    { level: 3, image: IMAGES.BUILDING_MINING_3 },
    { level: 4, image: IMAGES.BUILDING_MINING_4 },
    { level: 5, image: IMAGES.BUILDING_MINING_5 },
  ],
  HANGAR: [
    { level: 1, image: IMAGES.BUILDING_MINING_1 },
    { level: 2, image: IMAGES.BUILDING_MINING_2 },
    { level: 3, image: IMAGES.BUILDING_MINING_3 },
    { level: 4, image: IMAGES.BUILDING_MINING_4 },
    { level: 5, image: IMAGES.BUILDING_MINING_5 },
  ],
};
