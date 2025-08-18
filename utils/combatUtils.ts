import { CombatResult, Turn } from "@/src/types/combatResultTypes";
import {
  ALL_SHIP_TYPES,
  CombatShip,
  CustomShipTypeId,
  Ship,
  ShipData,
  ShipId,
  ShipSpecsCtx,
} from "@/src/types/shipType";
import { getSpecByType, makeShip, sumShipArray } from "./shipUtils";

// shape mínimo que comparten Ship y ShipData
export type MinimalShip = Pick<Ship, "type" | "amount">;

/* ----------------------------- helpers de orden ---------------------------- */

function buildOrder(present: Array<ShipId>, specs: ShipSpecsCtx): Array<ShipId> {
  const builtin = ALL_SHIP_TYPES.filter((t) => present.includes(t));
  const custom = present.filter(
    (t) => !(ALL_SHIP_TYPES as readonly string[]).includes(t as string)
  );

  // ordena custom por 'orden' si existe, luego por nombre, luego por id
  custom.sort((a, b) => {
    const sa = specs.customById[a as CustomShipTypeId];
    const sb = specs.customById[b as CustomShipTypeId];
    const oa = sa?.orden ?? Number.MAX_SAFE_INTEGER;
    const ob = sb?.orden ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    const na = sa?.name ?? String(a);
    const nb = sb?.name ?? String(b);
    return na.localeCompare(nb);
  });

  return [...builtin, ...custom];
}

/* ---------------------- expandir/compactar flotas (specs) ------------------ */

// Expande una flota a entidades individuales usando stats de specs (builtin/custom)

function expandFleet(fleet: ReadonlyArray<MinimalShip>, specs: ShipSpecsCtx): CombatShip[] {
  return fleet.flatMap((s) => {
    const spec = getSpecByType(s.type, specs);
    const base = makeShip(s.type, 1); // BuiltinShip o CustomShip según el id

    // Genera 'amount' entidades independientes
    return Array.from({ length: s.amount }, () => ({
      ...base, // incluye { custom, type, amount: 1 }
      hp: spec.hp,
      maxHp: spec.hp,
      attack: spec.attack,
      defense: spec.defense,
    }));
  });
}

// Agrupa la flota combativa en formato compacto ShipData[] contando naves por tipo
function regroupFleet(combatFleet: ReadonlyArray<CombatShip>, specs: ShipSpecsCtx): ShipData[] {
  const map = new Map<ShipId, number>();
  for (const { type } of combatFleet) {
    map.set(type, (map.get(type) ?? 0) + 1);
  }
  const order = buildOrder(Array.from(map.keys()), specs);
  return order.map((t) => makeShip(t, map.get(t)!));
}

/* ------------------------- daño / resolución de turnos --------------------- */

function calculateDamage(attacker: CombatShip, defender: CombatShip) {
  const rawDamage = attacker.attack - defender.defense;
  if (rawDamage > 1) return rawDamage;
  if (rawDamage >= -2) return 1;
  if (rawDamage >= -5) return 0.2;
  else 0.05;
}

function calculateDamageFromAttack(attackValue: number, defender: CombatShip) {
  const raw = attackValue - defender.defense;
  if (raw > 1) return raw;
  if (raw >= -2) return 1;
  return 0;
}

function executeTurn(fleetA: CombatShip[], fleetB: CombatShip[]) {
  const dmgOnB = new Map<CombatShip, number>();
  const dmgOnA = new Map<CombatShip, number>();

  const projHpB = (s: CombatShip) => s.hp - (dmgOnB.get(s) ?? 0);
  const projHpA = (s: CombatShip) => s.hp - (dmgOnA.get(s) ?? 0);

  const pickAlive = (arr: CombatShip[], projHp: (s: CombatShip) => number) => {
    const alive = arr.filter((s) => projHp(s) > 0);
    if (!alive.length) return null;
    return alive[Math.floor(Math.random() * alive.length)];
  };

  const shootersA = [...fleetA];
  const shootersB = [...fleetB];

  const firePhase = (
    shooters: CombatShip[],
    enemyFleet: CombatShip[],
    enemyDmgMap: Map<CombatShip, number>,
    projHp: (s: CombatShip) => number
  ) => {
    for (const attacker of shooters) {
      let currentAttack = attacker.attack;

      while (true) {
        const target = pickAlive(enemyFleet, projHp);
        if (!target) break;

        const dmg = calculateDamageFromAttack(currentAttack, target);
        if (dmg <= 0) break;

        const remaining = projHp(target);

        if (dmg >= remaining) {
          enemyDmgMap.set(target, (enemyDmgMap.get(target) ?? 0) + remaining);
          const overflowAttack = dmg - remaining;
          if (overflowAttack <= 0) break;
          currentAttack = overflowAttack;
          continue;
        } else {
          enemyDmgMap.set(target, (enemyDmgMap.get(target) ?? 0) + dmg);
          break;
        }
      }
    }
  };

  firePhase(shootersA, fleetB, dmgOnB, projHpB);
  firePhase(shootersB, fleetA, dmgOnA, projHpA);

  fleetB = fleetB.filter((s) => {
    const taken = dmgOnB.get(s) ?? 0;
    if (taken > 0) s.hp = Math.max(0, s.hp - taken);
    return s.hp > 0;
  });

  fleetA = fleetA.filter((s) => {
    const taken = dmgOnA.get(s) ?? 0;
    if (taken > 0) s.hp = Math.max(0, s.hp - taken);
    return s.hp > 0;
  });

  return { fleetA, fleetB };
}

/* ----------------------------- utilidades varias --------------------------- */

function makeId(date: number, sistem: string) {
  return `${date}-${sistem}-${Math.random().toString(36).slice(2, 10)}`;
}
function sum(list: ReadonlyArray<ShipData>) {
  return list.reduce((acc, s) => acc + s.amount, 0);
}

/* ------------------------------- simulación -------------------------------- */

export function simulateBattle(
  attackersIn: ReadonlyArray<ShipData>,
  defendersIn: ReadonlyArray<ShipData>,
  specs: ShipSpecsCtx,
  opts: {
    sistem: string;
    playerIsAttacker: boolean;
    date?: number;
    maxTurns?: number;
    id?: string;
  }
): CombatResult {
  let fleetA = expandFleet(attackersIn, specs);
  let fleetB = expandFleet(defendersIn, specs);

  const turns: Turn[] = [];
  const maxTurns = opts.maxTurns ?? 10_000;

  let turnNumber = 0;
  while (fleetA.length && fleetB.length && turnNumber < maxTurns) {
    turnNumber++;

    const beforeA = regroupFleet(fleetA, specs);
    const beforeB = regroupFleet(fleetB, specs);

    ({ fleetA, fleetB } = executeTurn(fleetA, fleetB));

    const afterA = regroupFleet(fleetA, specs);
    const afterB = regroupFleet(fleetB, specs);

    const lostA = diffLost(beforeA, afterA);
    const lostB = diffLost(beforeB, afterB);

    turns.push({
      turn: turnNumber,
      attackerRemaining: afterA,
      defenderRemaining: afterB,
      attackerLost: lostA,
      defenderLost: lostB,
    });
  }

  if (turns.length === 0) {
    turns.push({
      turn: 0,
      attackerRemaining: regroupFleet(fleetA, specs),
      defenderRemaining: regroupFleet(fleetB, specs),
      attackerLost: [],
      defenderLost: [],
    });
  }

  const last = turns[turns.length - 1];
  const attackersAlive = sum(last.attackerRemaining);
  const defendersAlive = sum(last.defenderRemaining);

  const attackerWins = defendersAlive === 0 && attackersAlive > 0;
  const defenderWins = attackersAlive === 0 && defendersAlive > 0;
  const playerWins = opts.playerIsAttacker ? attackerWins : defenderWins;

  const date = opts.date ?? Date.now();
  const id = opts.id ?? makeId(date, opts.sistem);

  return {
    id,
    date,
    sistem: opts.sistem,
    attackers: [...attackersIn],
    defenders: [...defendersIn],
    turns,
    playerIsAttacker: opts.playerIsAttacker,
    totalTurns: turns.length,
    playerWins,
  };
}

/* ------------------------------- pérdidas ---------------------------------- */

function toCountMap(list: ReadonlyArray<ShipData>): Record<ShipId, number> {
  const map = {} as Record<ShipId, number>;
  for (const s of list) map[s.type] = (map[s.type] ?? 0) + s.amount;
  return map;
}

function diffLost(before: ReadonlyArray<ShipData>, after: ReadonlyArray<ShipData>): ShipData[] {
  const b = toCountMap(before);
  const a = toCountMap(after);
  const types = new Set<ShipId>([...(Object.keys(b) as ShipId[]), ...(Object.keys(a) as ShipId[])]);
  const lost: ShipData[] = [];
  for (const t of types) {
    const delta = (b[t] ?? 0) - (a[t] ?? 0);
    if (delta > 0) lost.push({ type: t, amount: delta } as ShipData);
  }
  return lost;
}

export function aggregateLosses(turns: Turn[], key: "attackerLost" | "defenderLost") {
  const acc: Record<string, number> = {};
  for (const t of turns) {
    const map = sumShipArray(t[key]);
    for (const [type, n] of Object.entries(map)) {
      acc[type] = (acc[type] ?? 0) + n;
    }
  }
  const total = Object.values(acc).reduce((a, b) => a + b, 0);
  return { byType: acc, total };
}
