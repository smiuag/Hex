import { BuildingType } from "./tipos";

export const buildingConfig: Record<BuildingType, {
  name: string;
  baseBuildTime: number; // en ms
  image: number;
  underConstructionImage: number;
}> = {
  base: {
    name: 'base',
    baseBuildTime: 30000,
    image: require('../assets/images/mini/MainBase.png'),
    underConstructionImage: require('../assets/images/mini/MainBase.png'), 
  
  },
  factory: {
    name: 'Fábrica',
    baseBuildTime: 60000,
    image: require('../assets/images/mini/Factory.png'),
    underConstructionImage: require('../assets/images/mini/UnderConstruction.png'), 
  },
  lab: {
    name: 'Laboratorio',
    baseBuildTime: 45000,
    image: require('../assets/images/mini/Lab.png'),
    underConstructionImage: require('../assets/images/mini/UnderConstruction.png'), 
  },
};