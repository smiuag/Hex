import { BuildingType } from "../types/buildingTypes";
import { BuildingRequiredResearch } from "../types/researchTypes";
import { IMAGES } from "./images";

export const BUILDING_COST = {
  LAB: { stone: 18000, metal: 18000, energy: 100 },
  KRYSTALMINE: { stone: 36000, metal: 18000 },
  METALLURGY: { stone: 18000 },
  QUARRY: { metal: 18000 },
  BASE: { stone: 15000, metal: 15000, crystal: 15000 },
  ANTENNA: { stone: 7500, metal: 3500, crystal: 7500, energy: 300 },
  ROCKET: { stone: 15000, metal: 15000, crystal: 5000, energy: 300 },
  HANGAR: { stone: 15000, metal: 15000, crystal: 5000, energy: 300 },
  ENERGY: { stone: 8000, metal: 120000, crystal: 25000 },
  SPACESTATION: { stone: 18000, metal: 112000, crystal: 120000 },
};

export const BUILDING_PRODUCTION = {
  LAB: {},
  KRYSTALMINE: { crystal: 40 },
  METALLURGY: { metal: 50 },
  QUARRY: { stone: 60 },
  BASE: { stone: 10, metal: 10, energy: 5 },
  ANTENNA: {},
  ROCKET: {},
  HANGAR: {},
  ENERGY: { energy: 20 },
  SPACESTATION: {},
};

export const BUILDING_TIME = {
  LAB: 1000 * 60 * 0.2,
  KRYSTALMINE: 1000 * 60 * 1,
  METALLURGY: 1000 * 60 * 0.5,
  QUARRY: 1000 * 60 * 0.5,
  BASE: 1000 * 60 * 1,
  ANTENNA: 1000 * 60 * 30,
  ROCKET: 1000 * 60 * 60 * 2,
  HANGAR: 1000 * 60 * 15,
  ENERGY: 1000 * 60 * 5,
  SPACESTATION: 1000 * 60 * 60 * 24,
};

export const BUILDING_MAX_IN_PLANET = {
  LAB: 1,
  KRYSTALMINE: 3,
  METALLURGY: 7,
  QUARRY: 7,
  BASE: 1,
  ANTENNA: 1,
  ROCKET: 3,
  HANGAR: 1,
  ENERGY: 7,
  SPACESTATION: 1,
};

export const BUILDING_REQUIRED_RESEARCH: Record<
  BuildingType,
  BuildingRequiredResearch
> = {
  LAB: [],
  KRYSTALMINE: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
    { researchType: "MINING", researchLevelRequired: 2, builddingLevel: 3 },
    { researchType: "MINING", researchLevelRequired: 3, builddingLevel: 5 },
    { researchType: "MINING", researchLevelRequired: 4, builddingLevel: 7 },
  ],
  METALLURGY: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
    { researchType: "MINING", researchLevelRequired: 2, builddingLevel: 3 },
    { researchType: "MINING", researchLevelRequired: 3, builddingLevel: 4 },
    { researchType: "MINING", researchLevelRequired: 4, builddingLevel: 5 },
  ],
  QUARRY: [
    { researchType: "MINING", researchLevelRequired: 1, builddingLevel: 1 },
    { researchType: "MINING", researchLevelRequired: 2, builddingLevel: 3 },
    { researchType: "MINING", researchLevelRequired: 3, builddingLevel: 4 },
    { researchType: "MINING", researchLevelRequired: 4, builddingLevel: 5 },
  ],
  ENERGY: [
    {
      researchType: "ENERGYEFFICIENCY",
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
    {
      researchType: "ENERGYEFFICIENCY",
      researchLevelRequired: 2,
      builddingLevel: 3,
    },
    {
      researchType: "ENERGYEFFICIENCY",
      researchLevelRequired: 3,
      builddingLevel: 6,
    },
  ],
  BASE: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 1,
      builddingLevel: 2,
    },
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 3,
    },
    {
      researchType: "WATERPURIFICATION",
      researchLevelRequired: 1,
      builddingLevel: 3,
    },
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 3,
      builddingLevel: 4,
    },
    {
      researchType: "WATERPURIFICATION",
      researchLevelRequired: 2,
      builddingLevel: 4,
    },
  ],
  ANTENNA: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "ENERGYEFFICIENCY",
      researchLevelRequired: 2,
      builddingLevel: 2,
    },
  ],
  ROCKET: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "FUELREFINEMENT",
      researchLevelRequired: 3,
      builddingLevel: 2,
    },
  ],
  HANGAR: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "FUELREFINEMENT",
      researchLevelRequired: 2,
      builddingLevel: 2,
    },
  ],
  SPACESTATION: [
    {
      researchType: "SHIPENGINEERING",
      researchLevelRequired: 5,
      builddingLevel: 1,
    },
    {
      researchType: "GRAVITY",
      researchLevelRequired: 2,
      builddingLevel: 2,
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
  ENERGY: [
    { level: 1, image: IMAGES.BUILDING_ENERGY_1 },
    { level: 2, image: IMAGES.BUILDING_ENERGY_2 },
    { level: 3, image: IMAGES.BUILDING_ENERGY_3 },
    { level: 4, image: IMAGES.BUILDING_ENERGY_4 },
    { level: 5, image: IMAGES.BUILDING_ENERGY_5 },
  ],
  SPACESTATION: [{ level: 1, image: IMAGES.SPACESTATION_BACKGROUND }],
};
