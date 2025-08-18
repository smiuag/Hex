import { ImageSourcePropType } from "react-native";
import { GENERAL_FACTOR } from "../constants/general";
import { IMAGES } from "../constants/images";
import { ShipResearchRequiredData } from "./researchTypes";
import { CombinedResources } from "./resourceTypes";

/* ============================= IDs y catálogos ============================= */

export type ShipType =
  | "PROBE"
  | "LIGHTFIGHTER"
  | "INTERCEPTOR"
  | "ESCORTFRIGATE"
  | "BATTLECRUISER"
  | "SPACEDESTROYER"
  | "ASSAULTBATTLESHIP"
  | "STARCARRIER"
  | "HEAVYASSAULTSHIP"
  | "ORBITALASSAULTSHIP"
  | "PLANETARYDESTROYER"
  | "FREIGHTER";

export const ALL_SHIP_TYPES: ShipType[] = [
  "PROBE",
  "LIGHTFIGHTER",
  "INTERCEPTOR",
  "ESCORTFRIGATE",
  "BATTLECRUISER",
  "SPACEDESTROYER",
  "ASSAULTBATTLESHIP",
  "STARCARRIER",
  "HEAVYASSAULTSHIP",
  "ORBITALASSAULTSHIP",
  "PLANETARYDESTROYER",
  "FREIGHTER",
] as const satisfies ShipType[];

export type ShipImageKey =
  | "DEFAULT_SHIP_1"
  | "DEFAULT_SHIP_2"
  | "DEFAULT_SHIP_3"
  | "DEFAULT_SHIP_4"
  | "DEFAULT_SHIP_5"
  | "DEFAULT_SHIP_6"
  | "DEFAULT_SHIP_7"
  | "DEFAULT_SHIP_8"
  | "DEFAULT_SHIP_9"
  | "DEFAULT_SHIP_10";

export const SHIP_IMAGE_KEYS: ShipImageKey[] = [
  "DEFAULT_SHIP_1",
  "DEFAULT_SHIP_2",
  "DEFAULT_SHIP_3",
  "DEFAULT_SHIP_4",
  "DEFAULT_SHIP_5",
  "DEFAULT_SHIP_6",
  "DEFAULT_SHIP_7",
  "DEFAULT_SHIP_8",
  "DEFAULT_SHIP_9",
  "DEFAULT_SHIP_10",
];

export const SHIP_IMAGES: Record<ShipImageKey, ImageSourcePropType> = {
  DEFAULT_SHIP_1: IMAGES.DEFAULT_SHIP_1,
  DEFAULT_SHIP_2: IMAGES.DEFAULT_SHIP_2,
  DEFAULT_SHIP_3: IMAGES.DEFAULT_SHIP_3,
  DEFAULT_SHIP_4: IMAGES.DEFAULT_SHIP_4,
  DEFAULT_SHIP_5: IMAGES.DEFAULT_SHIP_5,
  DEFAULT_SHIP_6: IMAGES.DEFAULT_SHIP_6,
  DEFAULT_SHIP_7: IMAGES.DEFAULT_SHIP_7,
  DEFAULT_SHIP_8: IMAGES.DEFAULT_SHIP_8,
  DEFAULT_SHIP_9: IMAGES.DEFAULT_SHIP_9,
  DEFAULT_SHIP_10: IMAGES.DEFAULT_SHIP_10,
};

export const SPEED_UNIT = 10;

export type CustomShipTypeId = `custom:${string}`;

/** Alias cómodo para claves de nave en general (builtin o custom). */
export type ShipId = ShipType | CustomShipTypeId;

/* ================================ Entidades ================================ */

export type ProductionFacilityType = "HANGAR" | "SPACESTATION";

/** Versión compacta: lo que guardas/transmites (sin progress). */
export type ShipData =
  | { custom: false; type: ShipType; amount: number }
  | { custom: true; type: CustomShipTypeId; amount: number };

/** Naves en estado de juego (pueden tener progreso). */
export type Ship = BuiltinShip | CustomShip;

export type BuiltinShip = {
  custom: false;
  type: ShipType;
  amount: number;
  progress?: {
    startedAt: number;
    targetAmount: number;
    notificationId?: string;
  };
};

export type CustomShip = {
  custom: true;
  type: CustomShipTypeId; // id de la spec custom
  amount: number;
  progress?: {
    startedAt: number;
    targetAmount: number;
    notificationId?: string;
  };
};

/** Naves “materializadas” para combate (Ship + stats de batalla). */
export type CombatShip = Ship & {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
};

/* ================================ Config base ============================== */

export type BuiltinConfigEntry = {
  baseBuildTime: number;
  imageBackground: ImageSourcePropType;
  baseCost: Partial<CombinedResources>;
  requiredResearch: ShipResearchRequiredData[];
  orden: number;
  productionFacility: ProductionFacilityType;
  attack: number;
  defense: number;
  speed: number;
  hp: number;
};

export type BuiltinConfig = Record<ShipType, BuiltinConfigEntry>;

/* ============================= Specs (comunes) ============================= */

/** Tecnos disponibles para recetas custom. */
export type AttackTech = "LASER" | "PLASMA";
export type DefenseTech = "ARMOR" | "SHIELD";

/**
 * Forma común que devolvemos desde helpers (tanto builtin adaptado como custom).
 * Para builtin, `name` puede ser el propio tipo o una etiqueta traducida.
 */
export type ShipSpecBase = {
  name: string;
  baseBuildTime: number;
  imageBackground: ImageSourcePropType;
  baseCost: Partial<CombinedResources>;
  productionFacility: ProductionFacilityType;
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  /** Solo se usa en UI/ordenación; builtin lo puede traer del config o ignorarlo. */
  requiredResearch?: ShipResearchRequiredData[];
  orden?: number;
};

/** Spec de nave custom creada por el jugador (receta). */
export type CustomShipSpec = ShipSpecBase & {
  kind: "custom";
  id: CustomShipTypeId;
  attackTech: AttackTech;
  defenseTech: DefenseTech;
  createdAt: number;
};

export type CustomSpecMap = Record<CustomShipTypeId, CustomShipSpec>;

/** Contexto combinado para acceder a stats tanto builtin como custom. */
export type ShipSpecsCtx = {
  builtin: BuiltinConfig; // catálogo estático
  customById: CustomSpecMap; // recetas del jugador
};

export type PrevMax = { attack: number; defense: number; speed: number; hp: number };
export const defaultCreationStats: PrevMax = { attack: 8, defense: 8, speed: 200, hp: 20 };

export type ResearchCaps = PrevMax;

export type ResearchTuning<R extends CombinedResources = CombinedResources> = {
  maxMultiplier: number;
  successRange: { min: number; max: number };
  costPerUnit: {
    attack: { LASER: Partial<R>; PLASMA: Partial<R> };
    defense: { ARMOR: Partial<R>; SHIELD: Partial<R> };
    speed: Partial<R>;
    hp: Partial<R>;
  };
  multiplier: number;
  multiplierHP: number;
  multiplierSpeed: number;
  attemptCostScale: number;
  difficultyWeight: number;
};

export const TUNING: ResearchTuning = {
  maxMultiplier: 1.3, //Máximo sobre la última investigación
  successRange: { min: 0.5, max: 0.1 },
  attemptCostScale: 0.5,
  difficultyWeight: 1.0,
  costPerUnit: {
    attack: {
      LASER: {
        METAL: 20000 / GENERAL_FACTOR,
        CRYSTAL: 7000 / GENERAL_FACTOR,
        ENERGY: 1000 / GENERAL_FACTOR,
        KAIROX: 47 / GENERAL_FACTOR,
      } as Partial<CombinedResources>,
      PLASMA: {
        METAL: 20000 / GENERAL_FACTOR,
        CRYSTAL: 7000 / GENERAL_FACTOR,
        ENERGY: 1000 / GENERAL_FACTOR,
        AETHERIUM: 49 / GENERAL_FACTOR,
      } as Partial<CombinedResources>,
    },
    defense: {
      ARMOR: {
        CRYSTAL: 20000 / GENERAL_FACTOR,
        ENERGY: 1000 / GENERAL_FACTOR,
        ILMENITA: 47 / GENERAL_FACTOR,
      } as Partial<CombinedResources>,
      SHIELD: {
        CRYSTAL: 20000 / GENERAL_FACTOR,
        ENERGY: 1000 / GENERAL_FACTOR,
        THARNIO: 46 / GENERAL_FACTOR,
      } as Partial<CombinedResources>,
    },
    speed: {
      NEBULITA: 123 / GENERAL_FACTOR,
      ENERGY: 2 / GENERAL_FACTOR,
    } as Partial<CombinedResources>,
    hp: {
      METAL: 360 / GENERAL_FACTOR,
      STONE: 430 / GENERAL_FACTOR,
      ENERGY: 26 / GENERAL_FACTOR,
    } as Partial<CombinedResources>,
  },
  multiplier: 1.5,
  multiplierHP: 1.2,
  multiplierSpeed: 1.1,
};

export type Draft = {
  name: string;
  attackTech: AttackTech;
  defenseTech: DefenseTech;
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  imageKey?: ShipImageKey;
};

export type ShipDesignAttemptStatus = "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";

export type ShipDesignAttempt = {
  id: string;
  draft: Draft;
  draftHash: string;
  startedAt: number;
  baseSuccessChance: number;
  bonusSuccess: number;
  retryCount: number;
  attemptCost: Partial<CombinedResources>;
  status: ShipDesignAttemptStatus;
  resultSpecId?: CustomShipTypeId;
};

export const SHIP_DESIGN_ATTEMPT_DEFAULT: ShipDesignAttempt = {
  id: "__initial__",
  draft: {
    name: "",
    attackTech: "LASER",
    defenseTech: "ARMOR",
    attack: 0,
    defense: 0,
    speed: 0,
    hp: 0,
    imageKey: "DEFAULT_SHIP_1",
  } as Draft,
  draftHash: "",
  startedAt: 0,
  baseSuccessChance: 0,
  bonusSuccess: 0,
  retryCount: 0,
  attemptCost: {} as Partial<CombinedResources>,
  status: "CANCELED",
};
