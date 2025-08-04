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
    reward: { STONE: 18000, METAL: 18000, ENERGY: 100 },
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
    reward: { STONE: 18000, METAL: 18000 },
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
    reward: { METAL: 18000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    order: 6,
    backgroundImage: IMAGES.KRYSTALMINE_BACKGROUND,
    reward: { STONE: 12000, METAL: 12000, CRYSTAL: 15000 },
    contextType: "BUILD",
    persist: false,
  },
  H2O_SEARCH: {
    type: "H2O_SEARCH",
    order: 10,
    backgroundImage: IMAGES.H2O_SEARCH,
    reward: { STONE: 12000, METAL: 12000, CRYSTAL: 10000 },
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
    reward: { ENERGY: 5000 },
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
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
    contextType: "FLEET",
    persist: false,
  },
};
