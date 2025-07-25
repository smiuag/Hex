import { ImageSourcePropType } from "react-native";
import {
  FLEET_BACKGROUND_IMAGE,
  FLEET_COST,
  FLEET_REQUIRED_RESEARCH,
  FLEET_TIME,
} from "../constants/fleet";
import { FleetType, ProductionFacilityType } from "../types/fleetType";
import { FleetResearchRequiredData } from "../types/researchTypes";
import { Resources } from "../types/resourceTypes";

export const fleetConfig: Record<
  FleetType,
  {
    name: string;
    baseBuildTime: number;
    imageBackground: ImageSourcePropType;
    baseCost: Partial<Resources>;
    requiredResearch: FleetResearchRequiredData[];
    description: string;
    orden: number;
    productionFacility: ProductionFacilityType;
  }
> = {
  LIGHTFIGHTER: {
    name: "Caza ligero",
    orden: 1,
    baseBuildTime: FLEET_TIME.LIGHTFIGHTER,
    imageBackground: FLEET_BACKGROUND_IMAGE.LIGHTFIGHTER,
    baseCost: FLEET_COST.LIGHTFIGHTER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.LIGHTFIGHTER,
    productionFacility: "HANGAR",
    description:
      "Nave rápida y ágil diseñada para combates aéreos y patrullas de defensa.",
  },
  INTERCEPTOR: {
    name: "Interceptor",
    orden: 2,
    baseBuildTime: FLEET_TIME.INTERCEPTOR,
    imageBackground: FLEET_BACKGROUND_IMAGE.INTERCEPTOR,
    baseCost: FLEET_COST.INTERCEPTOR,
    requiredResearch: FLEET_REQUIRED_RESEARCH.INTERCEPTOR,
    productionFacility: "HANGAR",
    description:
      "Especializado en interceptar y eliminar amenazas enemigas antes de que se acerquen.",
  },
  ESCORTFRIGATE: {
    name: "Fragata de escolta",
    orden: 3,
    baseBuildTime: FLEET_TIME.ESCORTFRIGATE,
    imageBackground: FLEET_BACKGROUND_IMAGE.ESCORTFRIGATE,
    baseCost: FLEET_COST.ESCORTFRIGATE,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ESCORTFRIGATE,
    productionFacility: "HANGAR",
    description:
      "Protege naves mayores y convoyes, combinando defensa y maniobrabilidad eficiente.",
  },
  BATTLECRUISER: {
    name: "Crucero de batalla",
    orden: 4,
    baseBuildTime: FLEET_TIME.BATTLECRUISER,
    imageBackground: FLEET_BACKGROUND_IMAGE.BATTLECRUISER,
    baseCost: FLEET_COST.BATTLECRUISER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.BATTLECRUISER,
    productionFacility: "HANGAR",
    description:
      "Nave poderosa capaz de atacar con fuerza y resistir daños considerables en batalla.",
  },
  SPACEDESTROYER: {
    name: "Destructor espacial",
    orden: 5,
    baseBuildTime: FLEET_TIME.SPACEDESTROYER,
    imageBackground: FLEET_BACKGROUND_IMAGE.SPACEDESTROYER,
    baseCost: FLEET_COST.SPACEDESTROYER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.SPACEDESTROYER,
    productionFacility: "SPACESTATION",
    description:
      "Diseñado para eliminar naves enemigas y proteger las zonas estratégicas del espacio.",
  },
  ASSAULTBATTLESHIP: {
    name: "Acorazado de asalto",
    orden: 6,
    baseBuildTime: FLEET_TIME.ASSAULTBATTLESHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.ASSAULTBATTLESHIP,
    baseCost: FLEET_COST.ASSAULTBATTLESHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ASSAULTBATTLESHIP,
    productionFacility: "SPACESTATION",
    description:
      "Nave pesada equipada para ataques directos y romper líneas defensivas enemigas.",
  },
  STARCARRIER: {
    name: "Porta cazas",
    orden: 7,
    baseBuildTime: FLEET_TIME.STARCARRIER,
    imageBackground: FLEET_BACKGROUND_IMAGE.STARCARRIER,
    baseCost: FLEET_COST.STARCARRIER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.STARCARRIER,
    productionFacility: "SPACESTATION",
    description:
      "Base móvil para lanzar cazas y proporcionar soporte táctico en combate espacial.",
  },
  HEAVYASSAULTSHIP: {
    name: "Fragata pesada",
    orden: 8,
    baseBuildTime: FLEET_TIME.HEAVYASSAULTSHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.HEAVYASSAULTSHIP,
    baseCost: FLEET_COST.HEAVYASSAULTSHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.HEAVYASSAULTSHIP,
    productionFacility: "SPACESTATION",
    description:
      "Nave robusta con armamento pesado para incursiones agresivas y asedios prolongados.",
  },
  ORBITALASSAULTSHIP: {
    name: "Destructor orbital",
    orden: 9,
    baseBuildTime: FLEET_TIME.ORBITALASSAULTSHIP,
    imageBackground: FLEET_BACKGROUND_IMAGE.ORBITALASSAULTSHIP,
    baseCost: FLEET_COST.ORBITALASSAULTSHIP,
    requiredResearch: FLEET_REQUIRED_RESEARCH.ORBITALASSAULTSHIP,
    productionFacility: "SPACESTATION",
    description:
      "Especializada en asaltos desde órbita para tomar control rápido de objetivos planetarios.",
  },
  PLANETARYDESTROYER: {
    name: "Destructor planetario",
    orden: 10,
    baseBuildTime: FLEET_TIME.PLANETARYDESTROYER,
    imageBackground: FLEET_BACKGROUND_IMAGE.PLANETARYDESTROYER,
    baseCost: FLEET_COST.PLANETARYDESTROYER,
    requiredResearch: FLEET_REQUIRED_RESEARCH.PLANETARYDESTROYER,
    productionFacility: "SPACESTATION",
    description:
      "Unidad masiva diseñada para destruir estructuras y bases a escala planetaria.",
  },
};
