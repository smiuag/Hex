import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { ContextType, QuestType } from "../types/questType";
import { Resources } from "../types/resourceTypes";

export const questConfig: Record<
  QuestType,
  {
    type: QuestType;
    backgroundImage: ImageSourcePropType;
    requiredQuest: QuestType[];
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
    requiredQuest: [],
    reward: { STONE: 18000, METAL: 18000, ENERGY: 100 },
    contextType: "GENERAL",
    persist: true,
  },
  BUILDING_LAB1: {
    type: "BUILDING_LAB1",
    order: 2,
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["START"],
    reward: { STONE: 5000, METAL: 5000, ENERGY: 1000 },
    contextType: "BUILD",
    persist: false,
  },
  RESEARCH_MINING1: {
    order: 3,
    type: "RESEARCH_MINING1",
    backgroundImage: IMAGES.RESEARCH_MINING,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { STONE: 18000, METAL: 18000 },
    contextType: "RESEARCH",
    persist: false,
  },
  BUILDING_METALLURGY1: {
    type: "BUILDING_METALLURGY1",
    order: 4,
    backgroundImage: IMAGES.METALLURGY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { STONE: 36000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_QUARRY1: {
    type: "BUILDING_QUARRY1",
    order: 5,
    backgroundImage: IMAGES.QUARRY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { METAL: 18000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    order: 6,
    backgroundImage: IMAGES.KRYSTALMINE_BACKGROUND,
    requiredQuest: ["BUILDING_METALLURGY1", "BUILDING_QUARRY1"],
    reward: { STONE: 12000, METAL: 12000, CRYSTAL: 10000 },
    contextType: "BUILD",
    persist: false,
  },
  H2O_SEARCH: {
    type: "H2O_SEARCH",
    order: 10,
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    requiredQuest: ["BUILDING_KRYSTALMINE1"],
    reward: {},
    contextType: "GENERAL",
    persist: false,
  },
  H2O_FOUND: {
    type: "H2O_FOUND",
    order: 10,
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    requiredQuest: ["H2O_SEARCH"],
    reward: {},
    contextType: "BUILD",
    persist: false,
  },
  ALIEN_TECH_FOUND: {
    type: "ALIEN_TECH_FOUND",
    order: 10,
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    requiredQuest: ["H2O_SEARCH"],
    reward: {},
    contextType: "GENERAL",
    persist: true,
  },
  BUILDING_BASE2: {
    type: "BUILDING_BASE2",
    order: 7,
    backgroundImage: IMAGES.BASE_BACKGROUND,
    requiredQuest: ["BUILDING_KRYSTALMINE1"],
    reward: { STONE: 15000, METAL: 15000, ENERGY: 15000 },
    contextType: "GENERAL",
    persist: false,
  },
  BUILDING_ANTENNA: {
    type: "BUILDING_ANTENNA",
    order: 8,
    backgroundImage: IMAGES.ANTENNA_BACKGROUND,
    requiredQuest: ["BUILDING_BASE2"],
    reward: { ENERGY: 5000 },
    contextType: "BUILD",
    persist: false,
  },
  BUILDING_HANGAR: {
    type: "BUILDING_HANGAR",
    order: 9,
    backgroundImage: IMAGES.HANGAR_BACKGROUND,
    requiredQuest: ["BUILDING_ANTENNA"],
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
    contextType: "GENERAL",
    persist: false,
  },
  SHIP_FIRST: {
    type: "SHIP_FIRST",
    order: 10,
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    requiredQuest: ["BUILDING_HANGAR"],
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
    contextType: "FLEET",
    persist: false,
  },
};
