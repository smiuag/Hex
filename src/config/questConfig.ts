import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { ContextType, QuestType } from "../types/questType";
import { Resources } from "../types/resourceTypes";

export const questConfig: Record<
  QuestType,
  {
    type: QuestType;
    backgroundImage: ImageSourcePropType;
    reward: Partial<Resources>;
    order: number;
    contextType: ContextType;
    persist: boolean;
  }
> = {
  START: {
    type: "START",
    order: 1,
    backgroundImage: IMAGES.BACKGROUND_MENU_IMAGE,
    reward: { STONE: 3000, METAL: 3000, ENERGY: 100 },
    contextType: "GENERAL",
    persist: true,
  },
  BUILDING_LAB1: {
    type: "BUILDING_LAB1",
    order: 2,
    backgroundImage: IMAGES.LAB_BACKGROUND,
    reward: { STONE: 5000, METAL: 5000, ENERGY: 1000 },
    contextType: "BUILD",
    persist: false,
  },
  RESEARCH_MINING1: {
    order: 3,
    type: "RESEARCH_MINING1",
    backgroundImage: IMAGES.RESEARCH_MINING,
    reward: { STONE: 18000, METAL: 24000, ENERGY: 500 },
    contextType: "RESEARCH",
    persist: false,
  },
  BUILDING_METALLURGY1: {
    type: "BUILDING_METALLURGY1",
    order: 4,
    backgroundImage: IMAGES.METALLURGY_BACKGROUND,
    reward: { STONE: 36000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_QUARRY1: {
    type: "BUILDING_QUARRY1",
    order: 5,
    backgroundImage: IMAGES.QUARRY_BACKGROUND,
    reward: { STONE: 5000, METAL: 31000, CRYSTAL: 7000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    order: 6,
    backgroundImage: IMAGES.KRYSTALMINE_BACKGROUND,
    reward: { STONE: 31000, METAL: 17000, CRYSTAL: 27000 },
    contextType: "BUILD",
    persist: false,
  },
  H2O_SEARCH: {
    type: "H2O_SEARCH",
    order: 10,
    backgroundImage: IMAGES.H2O_SEARCH,
    reward: { STONE: 25000, METAL: 25000, CRYSTAL: 10000 },
    contextType: "GENERAL",
    persist: false,
  },
  H2O_FOUND: {
    type: "H2O_FOUND",
    order: 10,
    backgroundImage: IMAGES.H2O_FOUND,
    reward: { STONE: 12000, METAL: 12000, CRYSTAL: 10000 },
    contextType: "BUILD",
    persist: false,
  },
  ALIEN_TECH_FOUND: {
    type: "ALIEN_TECH_FOUND",
    order: 10,
    backgroundImage: IMAGES.ALIEN_TECH_FOUND,
    reward: {},
    contextType: "GENERAL",
    persist: true,
  },
  BUILDING_BASE2: {
    type: "BUILDING_BASE2",
    order: 7,
    backgroundImage: IMAGES.BASE_BACKGROUND,
    reward: { STONE: 30000, METAL: 15000, ENERGY: 15000 },
    contextType: "GENERAL",
    persist: false,
  },
  BUILDING_ANTENNA: {
    type: "BUILDING_ANTENNA",
    order: 8,
    backgroundImage: IMAGES.ANTENNA_BACKGROUND,
    reward: { STONE: 13000, METAL: 13000, CRYSTAL: 3000, ENERGY: 500 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_HANGAR: {
    type: "BUILDING_HANGAR",
    order: 9,
    backgroundImage: IMAGES.HANGAR_BACKGROUND,
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
    contextType: "GENERAL",
    persist: false,
  },
  SHIP_FIRST: {
    type: "SHIP_FIRST",
    order: 10,
    backgroundImage: IMAGES.SHIP_BG_PROBE,
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
    contextType: "FLEET",
    persist: false,
  },
  EXPLORE_SYSTEM: {
    type: "EXPLORE_SYSTEM",
    order: 11,
    backgroundImage: IMAGES.RED_DWARF,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "FLEET",
    persist: false,
  },
  BUILDING_EMBASSY: {
    type: "BUILDING_EMBASSY",
    order: 12,
    backgroundImage: IMAGES.EMBASSY_QUEST_BACKGROUND,
    reward: { STONE: 13000, METAL: 13000, CRYSTAL: 3000, ENERGY: 500 },
    contextType: "BUILD",
    persist: true,
  },
  SCAN_FIRST: {
    type: "SCAN_FIRST",
    order: 13,
    backgroundImage: IMAGES.NEBULA,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "FLEET",
    persist: false,
  },
  SYSTEM_BUILT_DEFENSE: {
    type: "SYSTEM_BUILT_DEFENSE",
    order: 14,
    backgroundImage: IMAGES.TRINARY,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "SYSTEM",
    persist: false,
  },
  SYSTEM_BUILT_EXTRACTION: {
    type: "SYSTEM_BUILT_EXTRACTION",
    order: 15,
    backgroundImage: IMAGES.DEAD_STAR,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "SYSTEM",
    persist: false,
  },
  SYSTEM_BUILT_STARPORT: {
    type: "SYSTEM_BUILT_STARPORT",
    order: 16,
    backgroundImage: IMAGES.BINARY,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "SYSTEM",
    persist: false,
  },
  COLLECT: {
    type: "COLLECT",
    order: 17,
    backgroundImage: IMAGES.COLLECT,
    reward: { STONE: 10000, METAL: 10000, CRYSTAL: 10000 },
    contextType: "SYSTEM",
    persist: false,
  },
  BUILDING_ALIENT_LAB: {
    type: "BUILDING_ALIENT_LAB",
    order: 18,
    backgroundImage: IMAGES.ALIEN_LAB,
    reward: { STONE: 50000, METAL: 50000, CRYSTAL: 50000 },
    contextType: "SYSTEM",
    persist: true,
  },
};
