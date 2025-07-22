import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { QuestType } from "../types/questType";
import { Resources } from "../types/resourceTypes";

export const questConfig: Record<
  QuestType,
  {
    type: QuestType;
    description: string;
    namme: string;
    backgroundImage: ImageSourcePropType;
    requiredQuest: QuestType[];
    reward: Partial<Resources>;
  }
> = {
  START: {
    type: "START",
    description:
      "Visita tu diario de misiones. Completar las misiones te proporcionará beneficios, completalas para conseguir más.",
    namme: "Comenzando la colonia",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: [],
    reward: { stone: 10000, metal: 10000, energy: 1000 },
  },
  BUILDING_LAB1: {
    type: "BUILDING_LAB1",
    description: "Construye un laboratorio de nivel 1 en el planeta.",
    namme: "Laboratorio",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["START"],
    reward: { stone: 10000, metal: 10000, energy: 1000 },
  },
  BUILDING_KRYSTALMINE1: {
    type: "BUILDING_KRYSTALMINE1",
    description: "Construye una mina de cristal en el planeta.",
    namme: "Mina de cristal",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["BUILDING_METALLURGY1", "BUILDING_QUARRY1"],
    reward: { stone: 10000, metal: 10000, energy: 5000 },
  },
  BUILDING_METALLURGY1: {
    type: "BUILDING_METALLURGY1",
    description: "Construye una mina de metales en el planeta.",
    namme: "Mina de metales",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { stone: 300000 },
  },
  BUILDING_QUARRY1: {
    type: "BUILDING_QUARRY1",
    description:
      "Construye una cantera para la extracción de minerales sólidos en el planeta.",
    namme: "Cantera",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { metal: 150000 },
  },
  RESEARCH_TERRAFORMING1: {
    type: "RESEARCH_TERRAFORMING1",
    description: "Investiga la terraformación de nivel 1",
    namme: "Primera investigación",
    backgroundImage: IMAGES.LAB_BACKGROUND,
    requiredQuest: ["BUILDING_LAB1"],
    reward: { stone: 160000, metal: 160000 },
  },
};
