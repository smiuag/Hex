// type ShipType = {
//   type: string;
//   count: number;
//   attack: number;
//   defense: number;
//   hp: number;
// };

// /*
// const flotaA = [
//   { type: "Caza", count: 5, attack: 3, defense: 2, hp: 5 },
//   { type: "Destructor", count: 2, attack: 7, defense: 4, hp: 15 },
// ];

// const flotaB = [
//   { type: "Interceptor", count: 4, attack: 4, defense: 3, hp: 6 },
//   { type: "Fragata", count: 3, attack: 6, defense: 5, hp: 10 },
// ];

// const resultado = simulateBattle(flotaA, flotaB);
// console.log(resultado);
// */

// // Clona profundamente una flota expandiendo cada nave como entidad individual
// function expandFleet(fleet) {
//   return fleet.flatMap((shipType) =>
//     Array(shipType.count)
//       .fill()
//       .map(() => ({
//         type: shipType.type,
//         attack: shipType.attack,
//         defense: shipType.defense,
//         hp: shipType.hp,
//         maxHp: shipType.hp,
//       }))
//   );
// }

// // Calcula el daño que una nave hace a otra según las reglas
// function calculateDamage(attacker, defender) {
//   const rawDamage = attacker.attack - defender.defense;
//   if (rawDamage > 1) return rawDamage;
//   if (rawDamage >= -1) return 1;
//   return 0;
// }

// // Ejecuta un turno completo de combate
// function executeTurn(fleetA, fleetB) {
//   const allDestroyedA = new Set();
//   const allDestroyedB = new Set();

//   // Atacan las naves de A a B
//   fleetA.forEach((attacker, i) => {
//     if (!fleetB.length) return;
//     let damage = calculateDamage(attacker, fleetB[0]);
//     while (damage > 0 && fleetB.length) {
//       const targetIndex = Math.floor(Math.random() * fleetB.length);
//       const target = fleetB[targetIndex];

//       if (!target) break;

//       if (damage >= target.hp) {
//         damage -= target.hp;
//         allDestroyedB.add(targetIndex);
//         fleetB.splice(targetIndex, 1);
//       } else {
//         target.hp -= damage;
//         damage = 0;
//       }
//     }
//   });

//   // Atacan las naves de B a A
//   fleetB.forEach((attacker, i) => {
//     if (!fleetA.length) return;
//     let damage = calculateDamage(attacker, fleetA[0]);
//     while (damage > 0 && fleetA.length) {
//       const targetIndex = Math.floor(Math.random() * fleetA.length);
//       const target = fleetA[targetIndex];

//       if (!target) break;

//       if (damage >= target.hp) {
//         damage -= target.hp;
//         allDestroyedA.add(targetIndex);
//         fleetA.splice(targetIndex, 1);
//       } else {
//         target.hp -= damage;
//         damage = 0;
//       }
//     }
//   });

//   return { fleetA, fleetB };
// }

// // Ejecuta la simulación completa del combate hasta que una flota quede vacía
// function simulateBattle(fleetDataA, fleetDataB) {
//   let fleetA = expandFleet(fleetDataA);
//   let fleetB = expandFleet(fleetDataB);
//   const destroyedA = [];
//   const destroyedB = [];

//   while (fleetA.length && fleetB.length) {
//     const prevA = [...fleetA];
//     const prevB = [...fleetB];
//     ({ fleetA, fleetB } = executeTurn(fleetA, fleetB));

//     // Guardar cuántas naves se destruyeron en ese turno
//     destroyedA.push(...prevA.filter((a) => !fleetA.includes(a)));
//     destroyedB.push(...prevB.filter((b) => !fleetB.includes(b)));
//   }

//   return {
//     winner: fleetA.length ? "A" : "B",
//     destroyed: {
//       fleetA: destroyedA,
//       fleetB: destroyedB,
//     },
//     remaining: {
//       fleetA,
//       fleetB,
//     },
//   };
// }
