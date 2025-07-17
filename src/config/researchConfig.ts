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
};
