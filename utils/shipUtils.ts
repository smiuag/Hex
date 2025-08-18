import { shipConfig } from "@/src/config/shipConfig";
import { GENERAL_FACTOR } from "@/src/constants/general";
import { Research, ShipRequiredResearch } from "@/src/types/researchTypes";
import { CombinedResources } from "@/src/types/resourceTypes";
import {
  BuiltinConfigEntry,
  BuiltinShip,
  CustomShip,
  CustomShipTypeId,
  Draft,
  PrevMax,
  ResearchCaps,
  ResearchTuning,
  Ship,
  ShipData,
  ShipDesignAttempt,
  ShipId,
  ShipSpecBase,
  ShipSpecsCtx,
  ShipType,
  SPEED_UNIT,
} from "@/src/types/shipType";

export const isUnlocked = (type: string, playerResearch: Research[] = []): boolean => {
  const config = shipConfig[type as ShipType];
  if (!config) return false;

  const requiredResearch = config.requiredResearch;

  if (!requiredResearch || requiredResearch.length === 0) return true;

  return requiredResearch.every((req) => {
    const found = playerResearch.find((r) => r.data.type === req.researchType);
    return found !== undefined && found.data.level >= req.researchLevelRequired;
  });
};

export const getTotalShipCost = (
  type: ShipId,
  specs: ShipSpecsCtx,
  amount: number
): CombinedResources => {
  const config = getSpecByType(type, specs);
  const base = config.baseCost;
  const result: CombinedResources = {} as CombinedResources;

  for (const key in base) {
    const resource = key as keyof CombinedResources;
    const baseValue = base[resource]!;
    result[resource] = (baseValue * amount) / GENERAL_FACTOR;
  }

  return result;
};

export const getFlyTime = (speed: number, distance: number) => {
  return (Math.round(distance / (speed / 10)) * 10000) / GENERAL_FACTOR;
};

export const getUnmetRequirements = (
  requiredResearch: ShipRequiredResearch,
  research: Research[]
) => {
  return (
    requiredResearch.filter((req) => {
      const playerResearchLevel =
        research.find((r) => r.data.type === req.researchType)?.data.level ?? 0;
      return playerResearchLevel < req.researchLevelRequired;
    }) ?? []
  );
};

export const getRandomShipAttackFleet = (shipBuildQueue: Ship[]): Ship[] => {
  const ships: Ship[] = [];
  shipBuildQueue.forEach((s) => {
    const amount = Math.ceil(Math.random() * 2 * s.amount);
    if (amount > 0 && s.type != "PROBE" && s.type != "FREIGHTER")
      ships.push(makeShip(s.type, amount));
  });

  if (ships.length == 0) ships.push(makeShip("ESCORTFRIGATE", 3));
  return ships;
};

export const getShips = (shipData: ShipData[]): Ship[] => {
  const ships: Ship[] = [];
  shipData.forEach((s) => {
    ships.push(makeShip(s.type, s.amount));
  });
  return ships;
};

export const totalShips = (ships: Array<{ type: any; amount: number }>) =>
  ships.reduce((s, sh) => s + (sh.amount || 0), 0);

export function sumShipArray(arr: ShipData[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of arr) map[s.type] = (map[s.type] ?? 0) + s.amount;
  return map;
}
// Adaptador builtin → forma común
const toSpecBase = (t: ShipType, c: BuiltinConfigEntry): ShipSpecBase => ({
  name: t, // o un pretty name si lo tienes
  baseBuildTime: c.baseBuildTime,
  imageBackground: c.imageBackground,
  baseCost: c.baseCost,
  productionFacility: c.productionFacility,
  attack: c.attack,
  defense: c.defense,
  speed: c.speed,
  hp: c.hp,
  requiredResearch: c.requiredResearch,
  orden: c.orden,
});

export const makeBuiltinShip = (type: ShipType, amount = 0): BuiltinShip => ({
  custom: false,
  type,
  amount,
});

export const makeCustomShip = (id: CustomShipTypeId, amount = 0): CustomShip => ({
  custom: true,
  type: id,
  amount,
});

export function makeShip(type: ShipType, amount: number): BuiltinShip;
export function makeShip(type: CustomShipTypeId, amount: number): CustomShip;
export function makeShip(type: ShipId, amount: number): Ship;
export function makeShip(type: ShipId, amount: number): Ship {
  return isCustomType(type) ? makeCustomShip(type, amount) : makeBuiltinShip(type, amount);
}

export const isCustomType = (t: ShipId | string): t is CustomShipTypeId =>
  typeof t === "string" && t.startsWith("custom:");

export const isBuiltinType = (t: ShipId): t is ShipType => !isCustomType(t);

// Overloads opcionales (dan mejor inferencia en el call-site)
export function getSpecByType(type: ShipType, specs: ShipSpecsCtx): ShipSpecBase;
export function getSpecByType(type: CustomShipTypeId, specs: ShipSpecsCtx): ShipSpecBase;
export function getSpecByType(type: ShipId, specs: ShipSpecsCtx): ShipSpecBase;

// Implementación (la única con cuerpo)
export function getSpecByType(type: ShipId, specs: ShipSpecsCtx): ShipSpecBase {
  if (isCustomType(type)) {
    const s = specs.customById[type];
    if (!s) throw new Error(`Spec custom no encontrada: ${type}`);
    return s;
  }
  const c = specs.builtin[type]; // aquí ya es ShipType por el guard
  if (!c) throw new Error(`Spec builtin no encontrada: ${type}`);
  return toSpecBase(type, c);
}

export function getSpecByShip(ship: Ship, specs: ShipSpecsCtx): ShipSpecBase {
  return getSpecByType(ship.type, specs);
}

export const getSpeed = (tOrShip: Ship["type"] | Ship, specs: ShipSpecsCtx) =>
  typeof tOrShip === "string"
    ? getSpecByType(tOrShip, specs).speed
    : getSpecByShip(tOrShip, specs).speed;

export const getBaseBuildTime = (tOrShip: Ship["type"] | Ship, specs: ShipSpecsCtx) =>
  typeof tOrShip === "string"
    ? getSpecByType(tOrShip, specs).baseBuildTime
    : getSpecByShip(tOrShip, specs).baseBuildTime;

export function addResources<T extends object>(...items: Partial<T>[]): Partial<T> {
  const out: any = {};
  for (const it of items) for (const k in it) out[k] = (out[k] ?? 0) + (it as any)[k];
  return out;
}

export function scaleResources<T extends object>(a: Partial<T>, factor: number): Partial<T> {
  const out: any = {};
  for (const k in a) out[k] = ((a as any)[k] ?? 0) * factor;
  return out;
}

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const computeCaps = (prev: PrevMax, mult: number): ResearchCaps => ({
  attack: Math.floor(prev.attack * mult),
  defense: Math.floor(prev.defense * mult),
  speed: Math.floor(prev.speed * mult),
  hp: Math.floor(prev.hp * mult),
});

export const normalizeDraft = (d: Draft, caps: ResearchCaps): Draft => ({
  ...d,
  attack: clamp(d.attack, 0, caps.attack),
  defense: clamp(d.defense, 0, caps.defense),
  speed: clamp(d.speed, 0, caps.speed),
  hp: clamp(d.hp, 0, caps.hp),
});

export function difficultyRatio(d: Draft, prev: PrevMax, caps: ResearchCaps) {
  const r = (val: number, p: number, cap: number) =>
    cap <= p ? 1 : clamp((val - p) / (cap - p), 0, 1);
  const arr = [
    r(d.attack, prev.attack, caps.attack),
    r(d.defense, prev.defense, caps.defense),
    r(d.speed, prev.speed, caps.speed),
    r(d.hp, prev.hp, caps.hp),
  ];
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function geomFactor(n: number, g: number) {
  if (n <= 0) return 0;
  if (!isFinite(g) || g <= 0) g = 1;
  if (Math.abs(g - 1) < 1e-9) return n;
  return (Math.pow(g, n) - 1) / (g - 1);
}

export function computeAttemptCost<R extends CombinedResources>(
  d: Draft,
  tuning: ResearchTuning<R>
): Partial<R> {
  // crecimiento
  const g = Math.max(1, tuning.multiplier ?? 1);
  const gHP = Math.max(1, tuning.multiplierHP ?? g);
  const gSpeed = Math.max(1, tuning.multiplierSpeed ?? g);

  // niveles (enteros) por stat
  const nAtk = Math.floor(d.attack);
  const nDef = Math.floor(d.defense);
  const nSpd = Math.floor(d.speed / SPEED_UNIT);
  const nHp = Math.floor(d.hp);

  // factores geométricos (progresión acumulada)
  const fAtk = geomFactor(nAtk, g);
  const fDef = geomFactor(nDef, g);
  const fSpd = geomFactor(nSpd, gSpeed);
  const fHp = geomFactor(nHp, gHP);

  // costes base por unidad
  const attackUnit = tuning.costPerUnit.attack[d.attackTech]; // LASER/PLASMA
  const defenseUnit = tuning.costPerUnit.defense[d.defenseTech]; // ARMOR/SHIELD

  // aplicar factores
  const attackCost = scaleResources<R>(attackUnit, fAtk);
  const defenseCost = scaleResources<R>(defenseUnit, fDef);
  const speedCost = scaleResources<R>(tuning.costPerUnit.speed, fSpd);
  const hpCost = scaleResources<R>(tuning.costPerUnit.hp, fHp);

  const base = addResources<R>(attackCost, defenseCost, speedCost, hpCost);
  return scaleResources<R>(base, tuning.attemptCostScale);
}

/** Corrige si `successRange.min > max` y aplica la dificultad. */
export function computeSuccessChance(
  d: Draft,
  prev: PrevMax,
  caps: ResearchCaps,
  tuning: ResearchTuning
) {
  const diff = difficultyRatio(d, prev, caps);
  const min = Math.min(tuning.successRange.min, tuning.successRange.max);
  const max = Math.max(tuning.successRange.min, tuning.successRange.max);
  const t = clamp(1 - diff * (tuning.difficultyWeight ?? 1), 0, 1);
  return clamp(min + (max - min) * t, min, max);
}

// stringify estable (ordena claves) para que el hash sea determinista
export function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",")}}`;
}

function designIdentity(d: Draft) {
  return {
    attackTech: d.attackTech,
    defenseTech: d.defenseTech,
    attack: Math.floor(d.attack),
    defense: Math.floor(d.defense),
    speedSteps: Math.floor(d.speed / SPEED_UNIT),
    hp: Math.floor(d.hp),
  };
}

export function computeDraftHash(d: Draft): string {
  return stableStringify(designIdentity(d));
}

// cuenta fallos consecutivos de un hash desde el final del historial
export function getConsecutiveFailsForHash(history: ShipDesignAttempt[], hash: string): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const it = history[i];
    if (it.draftHash !== hash) break;
    if (it.status === "FAILED") count++;
    else break; // success/canceled corta la racha
  }
  return count;
}

export function mergeMaxCreationStats(prev: PrevMax, attempted: PrevMax): PrevMax {
  return {
    attack: Math.max(prev.attack, attempted.attack ?? prev.attack),
    defense: Math.max(prev.defense, attempted.defense ?? prev.defense),
    speed: Math.max(prev.speed, attempted.speed ?? prev.speed),
    hp: Math.max(prev.hp, attempted.hp ?? prev.hp),
  };
}

export function extractCreationStatsFromDraft(draft: Draft): PrevMax {
  const { attack, defense, speed, hp } = (draft as any) ?? {};
  return { attack, defense, speed, hp };
}
