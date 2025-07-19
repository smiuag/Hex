import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import {
  LAB_LVL_REQUIRED,
  MAX_LVL,
  RESEARCH_COST,
  RESEARCH_TIME,
} from "../constants/research";
import { ResearchType } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";

export const researchTechnologies: Record<
  ResearchType,
  {
    name: string;
    labLevelRequired: number;
    image: ImageSourcePropType;
    description: string;
    maxLevel: number;
    baseCost: Partial<Resources>;
    baseResearchTime: number;
  }
> = {
  TERRAFORMING: {
    name: "Terraformación",
    labLevelRequired: LAB_LVL_REQUIRED.TERRAFORMING,
    image: IMAGES.RESEARCH_TERRAFORMING,
    baseCost: RESEARCH_COST.TERRAFORMING,
    baseResearchTime: RESEARCH_TIME.TERRAFORMING,
    maxLevel: MAX_LVL.TERRAFORMING,
    description:
      "Permite mejorar la base, algo necesario para ampliar su alcance y conseguir más area construible",
  },
  MINING: {
    name: "Minería",
    labLevelRequired: LAB_LVL_REQUIRED.MINING,
    image: IMAGES.RESEARCH_MINING,
    baseCost: RESEARCH_COST.MINING,
    baseResearchTime: RESEARCH_TIME.MINING,
    maxLevel: MAX_LVL.MINING,
    description: "Permite mejorar las minas de piedra, cristal y metal ",
  },
  WATERPURIFICATION: {
    name: "Purificación de Agua",
    labLevelRequired: LAB_LVL_REQUIRED.WATERPURIFICATION,
    image: IMAGES.RESEARCH_WATER,
    baseCost: RESEARCH_COST.WATERPURIFICATION,
    baseResearchTime: RESEARCH_TIME.WATERPURIFICATION,
    maxLevel: MAX_LVL.WATERPURIFICATION,
    description:
      "Desbloquea sistemas de filtrado y recolección de agua, vital para mantener la vida y expandir tu colonia.",
  },
  FUELREFINEMENT: {
    name: "Refinamiento de Combustible",
    labLevelRequired: LAB_LVL_REQUIRED.FUELREFINEMENT,
    image: IMAGES.RESEARCH_FUEL,
    baseCost: RESEARCH_COST.FUELREFINEMENT,
    baseResearchTime: RESEARCH_TIME.FUELREFINEMENT,
    maxLevel: MAX_LVL.FUELREFINEMENT,
    description:
      "Permite producir combustible más eficiente para los vehículos y sistemas avanzados de la base.",
  },
  ENERGIEFFICIENCY: {
    name: "Eficiencia Energética",
    labLevelRequired: LAB_LVL_REQUIRED.ENERGYEFFICIENCY,
    image: IMAGES.RESEARCH_ENERGY,
    baseCost: RESEARCH_COST.ENERGYEFFICIENCY,
    baseResearchTime: RESEARCH_TIME.ENERGYEFFICIENCY,
    maxLevel: MAX_LVL.ENERGYEFFICIENCY,
    description:
      "Optimiza el consumo energético de todas tus estructuras, reduciendo los costes de mantenimiento.",
  },
  SHIPENGINEERING: {
    name: "Ingeniería de Naves",
    labLevelRequired: LAB_LVL_REQUIRED.SHIPENGINEERING,
    image: IMAGES.RESEARCH_SHIPS,
    baseCost: RESEARCH_COST.SHIPENGINEERING,
    baseResearchTime: RESEARCH_TIME.SHIPENGINEERING,
    maxLevel: MAX_LVL.SHIPENGINEERING,
    description:
      "Permite construir naves exploradoras y cargueros, esenciales para la expansión y el comercio interestelar.",
  },
};
