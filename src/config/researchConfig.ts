import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../constants/images";
import { LAB_LVL_REQUIRED, MAX_LVL, RESEARCH_COST, RESEARCH_TIME } from "../constants/research";
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
  ENERGYEFFICIENCY: {
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
    name: "Ingeniería espacial",
    labLevelRequired: LAB_LVL_REQUIRED.SHIPENGINEERING,
    image: IMAGES.RESEARCH_SHIPS,
    baseCost: RESEARCH_COST.SHIPENGINEERING,
    baseResearchTime: RESEARCH_TIME.SHIPENGINEERING,
    maxLevel: MAX_LVL.SHIPENGINEERING,
    description:
      "Permite construir naves exploradoras y cargueros, esenciales para la expansión y el comercio interestelar.",
  },
  PLASMA: {
    name: "Tecnología de plasma",
    labLevelRequired: LAB_LVL_REQUIRED.PLASMA,
    image: IMAGES.RESEARCH_PLASMA,
    baseCost: RESEARCH_COST.PLASMA,
    baseResearchTime: RESEARCH_TIME.PLASMA,
    maxLevel: MAX_LVL.PLASMA,
    description: "Tecnología para el armamento de naves espaciales pesadas.",
  },
  LASER: {
    name: "Tecnología laser",
    labLevelRequired: LAB_LVL_REQUIRED.LASER,
    image: IMAGES.RESEARCH_LASER,
    baseCost: RESEARCH_COST.LASER,
    baseResearchTime: RESEARCH_TIME.LASER,
    maxLevel: MAX_LVL.LASER,
    description: "Tecnología base para el armamento ligero de naves espaciales.",
  },
  SHIELD: {
    name: "Escudos de energía",
    labLevelRequired: LAB_LVL_REQUIRED.SHIELD,
    image: IMAGES.RESEARCH_SHIELD,
    baseCost: RESEARCH_COST.SHIELD,
    baseResearchTime: RESEARCH_TIME.SHIELD,
    maxLevel: MAX_LVL.SHIELD,
    description: "Imprescindible para la construcción de destructores espaciales y naves orbitales",
  },
  GRAVITY: {
    name: "Tecnología de gravitón",
    labLevelRequired: LAB_LVL_REQUIRED.GRAVITY,
    image: IMAGES.RESEARCH_GRAVITY,
    baseCost: RESEARCH_COST.GRAVITY,
    baseResearchTime: RESEARCH_TIME.GRAVITY,
    maxLevel: MAX_LVL.GRAVITY,
    description: "Tecnología finalpara el dominio de las bases espaciales y motores WARP.",
  },
};
