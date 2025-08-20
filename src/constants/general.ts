import { Resources } from "../types/resourceTypes";

export const RAPIDO = true;
export const GENERAL_FACTOR = RAPIDO ? 1000 : 1; // 1- NORMAL, 10-ACELERADO PARA PRUEBAS

export const PRODUCTION_INCREMENT = 1.3;
export const BUILD_COST_INCREMENT = 2;
export const RESEARCH_COST_INCREMENT = 1.8;
export const BUILD_TIME_INCREMENT = 2.3;
export const RESEARCH_TIME_INCREMENT = 1.7;

export const SCAN_DURATION = RAPIDO ? 1000 : 1000 * 60 * 5;
export const STAR_BUILDINGS_DURATION = RAPIDO ? 1000 : 1000 * 60 * 60 * 1;
export const STAR_BUILDINGS_COST: Partial<Resources> = {
  METAL: RAPIDO ? 1 : 120000,
  CRYSTAL: RAPIDO ? 1 : 120000,
};
export const COLLECT_COST: Partial<Resources> = { ENERGY: RAPIDO ? 1 : 50000 };
export const RETRY_SUCCESS_BONUS = 0.1;
export const RETRY_SUCCESS_BONUS_CAP = 0.5;
