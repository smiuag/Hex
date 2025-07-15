import { BuildingType, Resources } from "./tipos";

export const buildingConfig: Record<
  BuildingType,
  {
    name: string;
    baseBuildTime: number;
    image: number;
    underConstructionImage: number;
    baseCost: Partial<Resources>;
    production: Partial<Resources>;
  }
> = {
  base: {
    name: "base",
    baseBuildTime: 30000,
    image: require("../assets/images/mini/MainBase.png"),
    underConstructionImage: require("../assets/images/mini/MainBase.png"),
    baseCost: { metal: 10000, energy: 500 },
    production: { metal: 3, energy: 1, crystal: 2 },
  },
  factory: {
    name: "Fábrica",
    baseBuildTime: 60000,
    image: require("../assets/images/mini/Factory.png"),
    underConstructionImage: require("../assets/images/mini/UnderConstruction.png"),
    baseCost: { metal: 1000, energy: 50 },
    production: { metal: 7 },
  },
  lab: {
    name: "Laboratorio",
    baseBuildTime: 45000,
    image: require("../assets/images/mini/Lab.png"),
    underConstructionImage: require("../assets/images/mini/UnderConstruction.png"),
    baseCost: { metal: 1000, energy: 50 },
    production: {},
  },
};
