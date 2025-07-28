import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { QuestType } from "../types/questType";
import { Resources } from "../types/resourceTypes";

export const questConfig: Record<
  QuestType,
  {
    type: QuestType;
    description: string;
    name: string;
    backgroundImage: ImageSourcePropType;
    requiredQuest: QuestType[];
    reward: Partial<Resources>;
    order: number;
  }
> = {
  START: {
    type: "START",
    order: 1,
    description:
      "Visita tu diario de misiones. Completar las misiones te proporcionará beneficios, completalas para conseguir más.",
    name: "Comenzando la colonia",
    backgroundImage: IMAGES.BACKGROUND_MENU_IMAGE,
    requiredQuest: [],
    reward: { STONE: 18000, METAL: 18000, ENERGY: 100 },
  },
  BUILDING_LAB1: {
    type: "BUILDING_LAB1",
    order: 2,
    description: "Construye un laboratorio de nivel 1 en el planeta.",
    name: "Laboratorio",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["START"],
    reward: { STONE: 5000, METAL: 5000, ENERGY: 1000 },
  },
  RESEARCH_MINING1: {
    order: 3,
    type: "RESEARCH_MINING1",
    description: "Investiga la minería de nivel 1",
    name: "Primera investigación",
    backgroundImage: IMAGES.RESEARCH_MINING,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { STONE: 18000, METAL: 18000 },
  },
  BUILDING_METALLURGY1: {
    type: "BUILDING_METALLURGY1",
    order: 4,
    description: "Construye una mina de metales en el planeta.",
    name: "Mina de metales",
    backgroundImage: IMAGES.METALLURGY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { STONE: 36000 },
  },
  BUILDING_QUARRY1: {
    type: "BUILDING_QUARRY1",
    order: 5,
    description: "Construye una cantera para la extracción de minerales sólidos en el planeta.",
    name: "Cantera",
    backgroundImage: IMAGES.QUARRY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { METAL: 18000 },
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    order: 6,
    description: "Construye una mina de cristal en el planeta.",
    name: "Mina de cristal",
    backgroundImage: IMAGES.KRYSTALMINE_BACKGROUND,
    requiredQuest: ["BUILDING_METALLURGY1", "BUILDING_QUARRY1"],
    reward: { STONE: 12000, METAL: 12000, CRYSTAL: 5000 },
  },
  BUILDING_BASE2: {
    type: "BUILDING_BASE2",
    order: 7,
    description: "Mejora el nivel de la base a nivel 2.",
    name: "Base de nivel 2",
    backgroundImage: IMAGES.BASE_BACKGROUND,
    requiredQuest: ["BUILDING_KRYSTALMINE1"],
    reward: { STONE: 15000, METAL: 15000, ENERGY: 15000 },
  },
  BUILDING_ANTENNA: {
    type: "BUILDING_ANTENNA",
    order: 8,
    description:
      "Construye una antena para intentar encontrar otros sistemas planetarios accesibles",
    name: "Antenas de radio",
    backgroundImage: IMAGES.ANTENNA_BACKGROUND,
    requiredQuest: ["BUILDING_BASE2"],
    reward: { ENERGY: 5000 },
  },
  BUILDING_HANGAR: {
    type: "BUILDING_HANGAR",
    order: 9,
    description: "Construye un hangar para poder comenzar la fabricación de naves",
    name: "Hangar",
    backgroundImage: IMAGES.HANGAR_BACKGROUND,
    requiredQuest: ["BUILDING_ANTENNA"],
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
  },
  SHIP_FIRST: {
    type: "SHIP_FIRST",
    order: 10,
    description: "Construye una nave de algún tipo.",
    name: "Primera flota",
    backgroundImage: IMAGES.SHIP_BG_HEAVYASSAULTSHIP,
    requiredQuest: ["BUILDING_HANGAR"],
    reward: { STONE: 10000, METAL: 10000, ENERGY: 10000 },
  },
};
