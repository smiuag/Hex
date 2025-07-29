import { shipConfig } from "@/src/config/shipConfig";
import { CombatShip, Ship, ShipType } from "../src/types/shipType";

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
  const rawDamage = attacker.attack - attacker.defense;
  if (rawDamage > 1) return rawDamage;
  if (rawDamage >= -1) return 1;
  return 0;
}

// Ejecuta un turno completo de combate
function executeTurn(fleetA: CombatShip[], fleetB: CombatShip[]) {
  const allDestroyedA = new Set();
  const allDestroyedB = new Set();

  // Atacan las naves de A a B
  fleetA.forEach((attacker, i) => {
    if (!fleetB.length) return;
    let damage = calculateDamage(attacker, fleetB[0]);
    while (damage > 0 && fleetB.length) {
      const targetIndex = Math.floor(Math.random() * fleetB.length);
      const target = fleetB[targetIndex];

      if (!target) break;

      const hp = shipConfig[target.type].hp;

      if (damage >= hp) {
        damage -= hp;
        allDestroyedB.add(targetIndex);
        fleetB.splice(targetIndex, 1);
      } else {
        target.hp -= damage;
        damage = 0;
      }
    }
  });

  // Atacan las naves de B a A
  fleetB.forEach((attacker, i) => {
    if (!fleetA.length) return;
    let damage = calculateDamage(attacker, fleetA[0]);
    while (damage > 0 && fleetA.length) {
      const targetIndex = Math.floor(Math.random() * fleetA.length);
      const target = fleetA[targetIndex];

      if (!target) break;

      if (damage >= target.hp) {
        damage -= target.hp;
        allDestroyedA.add(targetIndex);
        fleetA.splice(targetIndex, 1);
      } else {
        target.hp -= damage;
        damage = 0;
      }
    }
  });

  return { fleetA, fleetB };
}

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
  const destroyedA = [];
  const destroyedB = [];

  while (fleetA.length && fleetB.length) {
    const prevA = [...fleetA];
    const prevB = [...fleetB];
    ({ fleetA, fleetB } = executeTurn(fleetA, fleetB));

    destroyedA.push(...prevA.filter((a) => !fleetA.includes(a)));
    destroyedB.push(...prevB.filter((b) => !fleetB.includes(b)));
  }

  return {
    winner: fleetA.length ? "A" : "B",
    destroyed: {
      fleetA: destroyedA,
      fleetB: destroyedB,
    },
    remaining: {
      fleetA: regroupFleet(fleetA),
      fleetB: regroupFleet(fleetB),
    },
  };
}
