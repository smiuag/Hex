import { Resources } from "../types/resourceTypes";

export const GENERAL_FACTOR = 10000; // 1- NORMAL, 10-ACELERADO PARA PRUEBAS

export const PRODUCTION_INCREMENT = 1.3;
export const BUILD_COST_INCREMENT = 2;
export const RESEARCH_COST_INCREMENT = 1.8;
export const BUILD_TIME_INCREMENT = 2.3;
export const RESEARCH_TIME_INCREMENT = 1.7;

export const SCAN_DURATION = 1000;
export const STAR_BUILDINGS_DURATION = 1000;
export const STAR_BUILDINGS_COST: Partial<Resources> = { METAL: 1, CRYSTAL: 1 };
export const COLLECT_COST: Partial<Resources> = { ENERGY: 1 };
