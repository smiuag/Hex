import { shipConfig } from "@/src/config/shipConfig";
import { CombatShip, Ship, ShipType } from "@/src/types/shipType";

// Clona profundamente una flota expandiendo cada nave como entidad individual
function expandFleet(fleet: Ship[]): CombatShip[] {
  return fleet.flatMap((s) =>
    Array(s.amount)
      .fill(null)
      .map(() => ({
        ...s,
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

// Ejecuta un turno completo de combate
function executeTurn(fleetA: CombatShip[], fleetB: CombatShip[]) {
  // Ataque de A a B
  for (const attacker of fleetA) {
    if (!fleetB.length) break;
    let damage = 0;
    while (damage === 0 && fleetB.length) {
      // Seleccionar objetivo aleatorio
      const targetIndex = Math.floor(Math.random() * fleetB.length);
      const target = fleetB[targetIndex];
      if (!target) break;

      // Calcular daño contra este objetivo
      damage = calculateDamage(attacker, target);

      if (damage <= 0) break; // no puede dañar

      if (damage >= target.hp) {
        damage -= target.hp;
        fleetB.splice(targetIndex, 1);
        // Si aún queda daño, sigue atacando en el while
      } else {
        target.hp -= damage;
        if (target.hp < 0) target.hp = 0;
        damage = 0; // daño aplicado, fin turno de este atacante
      }
    }
  }

  // Ataque de B a A (mismo esquema)
  for (const attacker of fleetB) {
    if (!fleetA.length) break;
    let damage = 0;
    while (damage === 0 && fleetA.length) {
      const targetIndex = Math.floor(Math.random() * fleetA.length);
      const target = fleetA[targetIndex];
      if (!target) break;

      damage = calculateDamage(attacker, target);

      if (damage <= 0) break;

      if (damage >= target.hp) {
        damage -= target.hp;
        fleetA.splice(targetIndex, 1);
      } else {
        target.hp -= damage;
        if (target.hp < 0) target.hp = 0;
        damage = 0;
      }
    }
  }

  return { fleetA, fleetB };
}

// Agrupa la flota combativa en formato compacto Ship[] contando naves por tipo
function regroupFleet(combatFleet: CombatShip[]): Ship[] {
  const countMap: Record<string, number> = {};
  combatFleet.forEach((ship) => {
    countMap[ship.type] = (countMap[ship.type] || 0) + 1;
  });

  return Object.entries(countMap).map(([type, amount]) => ({
    type: type as ShipType,
    amount,
  }));
}

export function simulateBattle(fleetDataA: Ship[], fleetDataB: Ship[]) {
  let fleetA = expandFleet(fleetDataA);
  let fleetB = expandFleet(fleetDataB);

  while (fleetA.length && fleetB.length) {
    ({ fleetA, fleetB } = executeTurn(fleetA, fleetB));
  }

  return {
    winner: fleetA.length ? "A" : "B",
    destroyed: {
      fleetA: regroupFleet(expandFleet(fleetDataA))
        .map((ship) => {
          const remaining = fleetA.filter((s) => s.type === ship.type).length;
          return { ...ship, amount: ship.amount - remaining };
        })
        .filter((ship) => ship.amount > 0),
      fleetB: regroupFleet(expandFleet(fleetDataB))
        .map((ship) => {
          const remaining = fleetB.filter((s) => s.type === ship.type).length;
          return { ...ship, amount: ship.amount - remaining };
        })
        .filter((ship) => ship.amount > 0),
    },
    remaining: {
      fleetA: regroupFleet(fleetA),
      fleetB: regroupFleet(fleetB),
    },
  };
}
