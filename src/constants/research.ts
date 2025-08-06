import { ResearchRequiredBuilding } from "../types/buildingTypes";
import { ResearchType } from "../types/researchTypes";

export const RESEARCH_COST = {
  TERRAFORMING: { STONE: 10000, METAL: 10000, ENERGY: 500 },
  MINING: { STONE: 5000, METAL: 5000, ENERGY: 1000 },
  WATERPURIFICATION: { STONE: 1500, METAL: 1500, ENERGY: 10000 },
  FUELREFINEMENT: { STONE: 5000, METAL: 3000, ENERGY: 20000 },
  ENERGYEFFICIENCY: { STONE: 2000, METAL: 1000, ENERGY: 50000 },
  SHIPENGINEERING: { CRYSTAL: 3000, METAL: 20000, ENERGY: 100000 },
  LASER: { CRYSTAL: 3000, METAL: 20000, ENERGY: 100000 },
  PLASMA: { CRYSTAL: 3000, METAL: 15000, ENERGY: 150000 },
  SHIELD: { CRYSTAL: 6000, METAL: 20000, ENERGY: 150000 },
  GRAVITY: { CRYSTAL: 30000, METAL: 20000, ENERGY: 200000, AETHERIUM: 2000, THARNIO: 5000 },
};

export const RESEARCH_TIME = {
  TERRAFORMING: 1000 * 60 * 1.5,
  MINING: 1000 * 30,
  WATERPURIFICATION: 1000 * 60 * 60 * 2,
  FUELREFINEMENT: 1000 * 60 * 60 * 3,
  ENERGYEFFICIENCY: 1000 * 60,
  SHIPENGINEERING: 1000 * 60 * 60 * 1,
  LASER: 1000 * 60 * 60 * 4,
  PLASMA: 1000 * 60 * 60 * 24,
  SHIELD: 1000 * 60 * 60 * 24,
  GRAVITY: 1000 * 60 * 60 * 24 * 7,
};

export const MAX_LVL = {
  TERRAFORMING: 3,
  MINING: 4,
  WATERPURIFICATION: 3,
  FUELREFINEMENT: 3,
  ENERGYEFFICIENCY: 3,
  SHIPENGINEERING: 5,
  LASER: 3,
  PLASMA: 3,
  SHIELD: 3,
  GRAVITY: 2,
};

export const RESEARCH_REQUIRED_BUILDING: Record<ResearchType, ResearchRequiredBuilding> = {
  ENERGYEFFICIENCY: [{ buildingLevelRequired: 3, buildingType: "LAB", researchLevel: 1 }],
  FUELREFINEMENT: [
    { buildingLevelRequired: 2, buildingType: "LAB", researchLevel: 1 },
    { buildingLevelRequired: 1, buildingType: "RESIDUE", researchLevel: 1 },
  ],
  GRAVITY: [
    { buildingLevelRequired: 2, buildingType: "ALIEN_LAB", researchLevel: 1 },
    { buildingLevelRequired: 3, buildingType: "ALIEN_LAB", researchLevel: 2 },
  ],
  LASER: [{ buildingLevelRequired: 2, buildingType: "LAB", researchLevel: 1 }],
  MINING: [{ buildingLevelRequired: 1, buildingType: "LAB", researchLevel: 1 }],
  PLASMA: [{ buildingLevelRequired: 3, buildingType: "LAB", researchLevel: 1 }],
  SHIELD: [{ buildingLevelRequired: 3, buildingType: "LAB", researchLevel: 1 }],
  SHIPENGINEERING: [{ buildingLevelRequired: 1, buildingType: "LAB", researchLevel: 1 }],
  TERRAFORMING: [
    { buildingLevelRequired: 1, buildingType: "LAB", researchLevel: 1 },
    { buildingLevelRequired: 2, buildingType: "GREENHOUSE", researchLevel: 3 },
  ],
  WATERPURIFICATION: [{ buildingLevelRequired: 4, buildingType: "LAB", researchLevel: 1 }],
};
