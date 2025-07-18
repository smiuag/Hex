import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../types/imageTypes";
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
  terraforming: {
    name: "Terraformación",
    labLevelRequired: 0,
    image: IMAGES.RESEARCH_TERRAFORMING,
    baseCost: { metal: 1000, energy: 5000, crystal: 1000 },
    baseResearchTime: 50000,
    maxLevel: 4,
    description:
      "Permite mejorar la base, algo necesario para ampliar su alcance y conseguir más area construible",
  },
  mining: {
    name: "Minería",
    labLevelRequired: 1,
    image: IMAGES.RESEARCH_MINING,
    baseCost: { metal: 1000, energy: 5000, crystal: 1000 },
    baseResearchTime: 160000,
    maxLevel: 4,
    description: "Permite mejorar las minas de piedra, cristal y metal ",
  },
  waterPurification: {
    name: "Purificación de Agua",
    labLevelRequired: 2,
    image: IMAGES.RESEARCH_WATER,
    baseCost: { metal: 800, energy: 3000, crystal: 1200 },
    baseResearchTime: 60000,
    maxLevel: 3,
    description:
      "Desbloquea sistemas de filtrado y recolección de agua, vital para mantener la vida y expandir tu colonia.",
  },
  fuelRefinement: {
    name: "Refinamiento de Combustible",
    labLevelRequired: 3,
    image: IMAGES.RESEARCH_FUEL,
    baseCost: { metal: 2000, energy: 6000, crystal: 2000 },
    baseResearchTime: 90000,
    maxLevel: 4,
    description:
      "Permite producir combustible más eficiente para los vehículos y sistemas avanzados de la base.",
  },
  energyEfficiency: {
    name: "Eficiencia Energética",
    labLevelRequired: 2,
    image: IMAGES.RESEARCH_ENERGY,
    baseCost: { metal: 1200, energy: 3000, crystal: 1500 },
    baseResearchTime: 70000,
    maxLevel: 3,
    description:
      "Optimiza el consumo energético de todas tus estructuras, reduciendo los costes de mantenimiento.",
  },
  shipEngineering: {
    name: "Ingeniería de Naves",
    labLevelRequired: 4,
    image: IMAGES.RESEARCH_SHIPS,
    baseCost: { metal: 5000, energy: 8000, crystal: 4000 },
    baseResearchTime: 150000,
    maxLevel: 3,
    description:
      "Permite construir naves exploradoras y cargueros, esenciales para la expansión y el comercio interestelar.",
  },
};
