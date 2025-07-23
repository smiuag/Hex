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
  }
> = {
  START: {
    type: "START",
    description:
      "Visita tu diario de misiones. Completar las misiones te proporcionará beneficios, completalas para conseguir más.",
    name: "Comenzando la colonia",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: [],
    reward: { stone: 180000, metal: 180000, energy: 1000 },
  },
  BUILDING_LAB1: {
    type: "BUILDING_LAB1",
    description: "Construye un laboratorio de nivel 1 en el planeta.",
    name: "Laboratorio",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["START"],
    reward: { stone: 10000, metal: 10000, energy: 1000 },
  },
  RESEARCH_MINING1: {
    type: "RESEARCH_MINING1",
    description: "Investiga la terraformación de nivel 1",
    name: "Primera investigación",
    backgroundImage: IMAGES.RESEARCH_MINING,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { stone: 180000, metal: 180000 },
  },
  BUILDING_METALLURGY1: {
    type: "BUILDING_METALLURGY1",
    description: "Construye una mina de metales en el planeta.",
    name: "Mina de metales",
    backgroundImage: IMAGES.METALLURGY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { stone: 300000 },
  },
  BUILDING_QUARRY1: {
    type: "BUILDING_QUARRY1",
    description:
      "Construye una cantera para la extracción de minerales sólidos en el planeta.",
    name: "Cantera",
    backgroundImage: IMAGES.QUARRY_BACKGROUND,
    requiredQuest: ["RESEARCH_MINING1"],
    reward: { metal: 150000 },
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    description: "Construye una mina de cristal en el planeta.",
    name: "Mina de cristal",
    backgroundImage: IMAGES.KRYSTALMINE_BACKGROUND,
    requiredQuest: ["BUILDING_METALLURGY1", "BUILDING_QUARRY1"],
    reward: { stone: 10000, metal: 10000, energy: 5000 },
  },
};
