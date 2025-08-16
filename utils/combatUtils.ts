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

/**
 * Ejecuta un turno completo de combate (A ataca a B, luego B a A)
 * Overflow: si el daño excede el HP del objetivo, el sobrante continúa
 * contra otro objetivo aleatorio.
 */
function executeTurn(fleetA: CombatShip[], fleetB: CombatShip[]) {
  // Ataque de A a B
  for (const attacker of [...fleetA]) {
    if (!fleetB.length) break;

    let leftover = 0; // daño sobrante si "overkillea" un objetivo
    while (fleetB.length) {
      const targetIndex = Math.floor(Math.random() * fleetB.length);
      const target = fleetB[targetIndex];
      if (!target) break;

      const dmg = leftover > 0 ? leftover : calculateDamage(attacker, target);
      if (dmg <= 0) break; // no puede dañar

      if (dmg >= target.hp) {
        leftover = dmg - target.hp;
        fleetB.splice(targetIndex, 1);
        if (!fleetB.length || leftover <= 0) break;
      } else {
        target.hp -= dmg;
        if (target.hp < 0) target.hp = 0;
        leftover = 0;
        break; // fin del turno de este atacante
      }
    }
  }

  // Ataque de B a A (mismo esquema)
  for (const attacker of [...fleetB]) {
    if (!fleetA.length) break;

    let leftover = 0;
    while (fleetA.length) {
      const targetIndex = Math.floor(Math.random() * fleetA.length);
      const target = fleetA[targetIndex];
      if (!target) break;

      const dmg = leftover > 0 ? leftover : calculateDamage(attacker, target);
      if (dmg <= 0) break;

      if (dmg >= target.hp) {
        leftover = dmg - target.hp;
        fleetA.splice(targetIndex, 1);
        if (!fleetA.length || leftover <= 0) break;
      } else {
        target.hp -= dmg;
        if (target.hp < 0) target.hp = 0;
        leftover = 0;
        break;
      }
    }
  }

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
