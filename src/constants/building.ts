import { BuildingType } from "../types/buildingTypes";
import { BuildingRequiredResearch } from "../types/researchTypes";

export const BUILDING_COST = {
  LAB: { STONE: 18000, METAL: 18000, ENERGY: 100 },
  KRYSTALMINE: { STONE: 36000, METAL: 18000 },
  METALLURGY: { STONE: 18000 },
  QUARRY: { METAL: 18000 },
  BASE: { STONE: 15000, METAL: 15000, CRYSTAL: 15000 },
  ANTENNA: { STONE: 7500, METAL: 3500, CRYSTAL: 7500, ENERGY: 300 },
  ROCKET: { STONE: 15000, METAL: 15000, CRYSTAL: 5000, ENERGY: 300 },
  HANGAR: { STONE: 15000, METAL: 15000, CRYSTAL: 5000, ENERGY: 300 },
  ENERGY: { STONE: 8000, METAL: 120000, CRYSTAL: 25000 },
  SPACESTATION: { METAL: 1200000, CRYSTAL: 1200000 },
  RECYCLE: { STONE: 7500, METAL: 3500, CRYSTAL: 7500, ENERGY: 300 },
  RESIDUE: { STONE: 15000, METAL: 6500, CRYSTAL: 7500, ENERGY: 300 },
  GREENHOUSE: { STONE: 7500, METAL: 3500, CRYSTAL: 7500, ENERGY: 300 },
  WATEREXTRACTOR: { STONE: 7500, METAL: 3500, CRYSTAL: 7500, ENERGY: 300 },
  ALIEN_LAB: { STONE: 150000, METAL: 150000, CRYSTAL: 500000, ENERGY: 30000 },
};

export const BUILDING_PRODUCTION = {
  LAB: {},
  KRYSTALMINE: { CRYSTAL: 4 },
  METALLURGY: { METAL: 5 },
  QUARRY: { STONE: 6 },
  BASE: { STONE: 1, METAL: 1, ENERGY: 1 },
  ANTENNA: {},
  ROCKET: {},
  HANGAR: {},
  ENERGY: { ENERGY: 2 },
  SPACESTATION: {},
  RECYCLE: {},
  RESIDUE: {},
  GREENHOUSE: {},
  WATEREXTRACTOR: {},
  ALIEN_LAB: {},
};

export const BUILDING_TIME = {
  LAB: 1000 * 60 * 0.2,
  KRYSTALMINE: 1000 * 60 * 0.5,
  METALLURGY: 1000 * 60 * 0.5,
  QUARRY: 1000 * 60 * 0.5,
  BASE: 1000 * 60 * 1,
  ANTENNA: 1000 * 60 * 1.5,
  ROCKET: 1000 * 60 * 15,
  HANGAR: 1000 * 60 * 5,
  ENERGY: 1000 * 60 * 2,
  SPACESTATION: 1000 * 60 * 60 * 5,
  RECYCLE: 1000 * 60 * 15,
  RESIDUE: 1000 * 60 * 22,
  GREENHOUSE: 1000 * 60 * 5,
  WATEREXTRACTOR: 1000 * 60 * 5,
  ALIEN_LAB: 1000 * 60 * 60 * 12,
};

export const BUILDING_MAX_IN_PLANET = {
  LAB: 1,
  KRYSTALMINE: 5,
  METALLURGY: 7,
  QUARRY: 7,
  BASE: 1,
  ANTENNA: 1,
  ROCKET: 1,
  HANGAR: 1,
  ENERGY: 7,
  SPACESTATION: 1,
  RECYCLE: 1,
  RESIDUE: 1,
  GREENHOUSE: 1,
  WATEREXTRACTOR: 1,
  ALIEN_LAB: 1,
};

export const BUILDING_MAX_LVL = {
  LAB: 4,
  KRYSTALMINE: 4,
  METALLURGY: 4,
  QUARRY: 4,
  BASE: 4,
  ANTENNA: 4,
  ROCKET: 2,
  HANGAR: 2,
  ENERGY: 4,
  SPACESTATION: 1,
  RECYCLE: 2,
  RESIDUE: 2,
  GREENHOUSE: 4,
  WATEREXTRACTOR: 1,
  ALIEN_LAB: 3,
};

export const BUILDING_REQUIRED_RESEARCH: Record<BuildingType, BuildingRequiredResearch> = {
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
      researchLevelRequired: 1,
      builddingLevel: 1,
    },
    {
      researchType: "FUELREFINEMENT",
      researchLevelRequired: 2,
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
      researchLevelRequired: 1,
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
  RECYCLE: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "WATERPURIFICATION",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
  ],
  RESIDUE: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "WATERPURIFICATION",
      researchLevelRequired: 2,
      builddingLevel: 3,
    },
  ],
  GREENHOUSE: [
    {
      researchType: "TERRAFORMING",
      researchLevelRequired: 2,
      builddingLevel: 1,
    },
    {
      researchType: "WATERPURIFICATION",
      researchLevelRequired: 2,
      builddingLevel: 2,
    },
  ],
  WATEREXTRACTOR: [],
  ALIEN_LAB: [],
};
