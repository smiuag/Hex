import { shipConfig } from "@/src/config/shipConfig";
import { CombatResult, Turn } from "@/src/types/combatResultTypes";
import { ALL_SHIP_TYPES, CombatShip, Ship, ShipData, ShipType } from "@/src/types/shipType";
import { sumShipArray } from "./shipUtils";

// Usamos solo { type, amount } para expandir
type MinimalShip = Pick<Ship, "type" | "amount">;

// Clona profundamente una flota expandiendo cada nave como entidad individual
function expandFleet(fleet: ReadonlyArray<MinimalShip>): CombatShip[] {
  return fleet.flatMap((s) =>
    Array.from({ length: s.amount }, () => ({
      type: s.type,
      amount: 1, // cada entidad representa una sola nave
      hp: shipConfig[s.type].hp,
      maxHp: shipConfig[s.type].hp,
      attack: shipConfig[s.type].attack,
      defense: shipConfig[s.type].defense,
    }))
  );
}

// Calcula el daño que una nave hace a otra según las reglas
function calculateDamage(attacker: CombatShip, defender: CombatShip) {
  const rawDamage = attacker.attack - defender.defense; // defensa del defensor
  if (rawDamage > 1) return rawDamage;
  if (rawDamage >= -2) return 1;
  return 0;
}

// Agrupa la flota combativa en formato compacto ShipData[] contando naves por tipo
function regroupFleet(combatFleet: ReadonlyArray<CombatShip>): ShipData[] {
  const map = new Map<ShipType, number>();
  for (const { type } of combatFleet) {
    map.set(type, (map.get(type) ?? 0) + 1);
  }
  // Orden estable por ALL_SHIP_TYPES para que el UI sea consistente
  return ALL_SHIP_TYPES.filter((t): t is ShipType => map.has(t as ShipType)).map((t) => ({
    type: t as ShipType,
    amount: map.get(t as ShipType)!,
  }));
}

// Convierte una lista compacta a mapa por tipo
function toCountMap(list: ReadonlyArray<ShipData>): Record<ShipType, number> {
  const map = {} as Record<ShipType, number>;
  for (const s of list) map[s.type] = (map[s.type] ?? 0) + s.amount;
  return map;
}

// Diferencia entre antes y después (solo pérdidas, nunca negativos)
function diffLost(before: ReadonlyArray<ShipData>, after: ReadonlyArray<ShipData>): ShipData[] {
  const b = toCountMap(before);
  const a = toCountMap(after);
  const types = new Set<ShipType>([
    ...(Object.keys(b) as ShipType[]),
    ...(Object.keys(a) as ShipType[]),
  ]);
  const lost: ShipData[] = [];
  for (const t of types) {
    const delta = (b[t] ?? 0) - (a[t] ?? 0);
    if (delta > 0) lost.push({ type: t, amount: delta });
  }
  // Orden estable por ALL_SHIP_TYPES
  return ALL_SHIP_TYPES.filter((t): t is ShipType =>
    lost.some((x) => x.type === (t as ShipType))
  ).map((t) => lost.find((x) => x.type === (t as ShipType))!);
}

/* -------------------------------------------------------------------------- */
/*                             Resolución de turnos                            */
/* -------------------------------------------------------------------------- */

// Daño a partir de un valor de ataque numérico (para el overflow)
function calculateDamageFromAttack(attackValue: number, defender: CombatShip) {
  const raw = attackValue - defender.defense;
  if (raw > 1) return raw;
  if (raw >= -2) return 1;
  return 0;
}

function executeTurn(fleetA: CombatShip[], fleetB: CombatShip[]) {
  // Daño acumulado ESTE turno (hp reales se actualizan al final y persisten entre turnos)
  const dmgOnB = new Map<CombatShip, number>();
  const dmgOnA = new Map<CombatShip, number>();

  const projHpB = (s: CombatShip) => s.hp - (dmgOnB.get(s) ?? 0);
  const projHpA = (s: CombatShip) => s.hp - (dmgOnA.get(s) ?? 0);

  const pickAlive = (arr: CombatShip[], projHp: (s: CombatShip) => number) => {
    const alive = arr.filter((s) => projHp(s) > 0);
    if (!alive.length) return null;
    return alive[Math.floor(Math.random() * alive.length)];
  };

  // Congelamos quién dispara: así TODOS disparan este turno
  const shootersA = [...fleetA];
  const shootersB = [...fleetB];

  const firePhase = (
    shooters: CombatShip[],
    enemyFleet: CombatShip[],
    enemyDmgMap: Map<CombatShip, number>,
    projHp: (s: CombatShip) => number
  ) => {
    for (const attacker of shooters) {
      // El "ataque actual" empieza en el ataque base del atacante
      let currentAttack = attacker.attack;

      // Mientras pueda encadenar (overflow) y queden objetivos proyectados vivos
      while (true) {
        const target = pickAlive(enemyFleet, projHp);
        if (!target) break;

        // EL PUNTO CLAVE: el daño se calcula con currentAttack (no con attacker.attack fijo)
        const dmg = calculateDamageFromAttack(currentAttack, target);
        if (dmg <= 0) break; // no penetra: fin del turno de este atacante

        const remaining = projHp(target);

        if (dmg >= remaining) {
          // Programamos exactamente lo que le falta para morir…
          enemyDmgMap.set(target, (enemyDmgMap.get(target) ?? 0) + remaining);
          // …y el SOBRANTE DE DAÑO pasa a ser el NUEVO ATAQUE
          const overflowAttack = dmg - remaining;
          if (overflowAttack <= 0) break;

          currentAttack = overflowAttack; // ahora esto se enfrentará a la defensa del próximo objetivo
          // seguimos el while para elegir otro objetivo y volver a calcular
          continue;
        } else {
          // Solo hiere: programar daño y terminar el turno del atacante
          enemyDmgMap.set(target, (enemyDmgMap.get(target) ?? 0) + dmg);
          break;
        }
      }
    }
  };

  // Disparan ambos bandos "a la vez" (nadie muere hasta aplicar el daño)
  firePhase(shootersA, fleetB, dmgOnB, projHpB);
  firePhase(shootersB, fleetA, dmgOnA, projHpA);

  // Aplicar daño al final del turno; hp persiste entre turnos (daño acumulado de todo el combate)
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

/* -------------------------------------------------------------------------- */
/*                           Simulación + logging (log)                        */
/* -------------------------------------------------------------------------- */

function makeId(date: number, sistem: string) {
  return `${date}-${sistem}-${Math.random().toString(36).slice(2, 10)}`;
}

function sum(list: ReadonlyArray<ShipData>) {
  return list.reduce((acc, s) => acc + s.amount, 0);
}

/**
 * Simula el combate y devuelve el histórico por turnos + metadatos.
 * - `sistem`: nombre del sistema (con tu misma clave).
 * - `playerIsAttacker`: para saber de qué lado estaba el jugador.
 * - `maxTurns`: guardarraíl opcional contra estancamientos.
 * - `id`: opcional; si no lo pasas se genera.
 *
 * Nota: Entradas y salidas compactas usan `ShipData[]` (type + amount).
 */
export function simulateBattle(
  attackersIn: ReadonlyArray<ShipData>,
  defendersIn: ReadonlyArray<ShipData>,
  opts: {
    sistem: string;
    playerIsAttacker: boolean;
    date?: number;
    maxTurns?: number;
    id?: string;
  }
): CombatResult {
  let fleetA = expandFleet(attackersIn);
  let fleetB = expandFleet(defendersIn);

  const turns: Turn[] = [];
  const maxTurns = opts.maxTurns ?? 10_000;

  let turnNumber = 0;
  while (fleetA.length && fleetB.length && turnNumber < maxTurns) {
    turnNumber++;

    // Snapshot antes
    const beforeA = regroupFleet(fleetA);
    const beforeB = regroupFleet(fleetB);

    // Ejecutar turno completo
    ({ fleetA, fleetB } = executeTurn(fleetA, fleetB));

    // Snapshot después
    const afterA = regroupFleet(fleetA);
    const afterB = regroupFleet(fleetB);

    // Pérdidas en el turno
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

  // Si no hubo turnos (p.ej., una flota inicial vacía), capturamos un estado final
  if (turns.length === 0) {
    turns.push({
      turn: 0,
      attackerRemaining: regroupFleet(fleetA),
      defenderRemaining: regroupFleet(fleetB),
      attackerLost: [],
      defenderLost: [],
    });
  }

  const last = turns[turns.length - 1];
  const attackersAlive = sum(last.attackerRemaining);
  const defendersAlive = sum(last.defenderRemaining);

  // Ganador para el jugador
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
