import { buildingConfig } from "@/src/config/buildingConfig";
import { resourceEmojis } from "@/src/config/emojisConfig";
import { PRODUCTION_INCREMENT } from "@/src/constants/general";
import { Hex } from "@/src/types/hexTypes";
import {
  CombinedResources,
  CombinedResourcesType,
  NORMAL_KEYS,
  Resources,
  ResourceType,
  SPECIAL_TYPES,
  SpecialResourceType,
  StoredResources,
} from "@/src/types/resourceTypes";
import { Ship, ShipData, ShipSpecsCtx } from "@/src/types/shipType";
import { StarSystem } from "@/src/types/starSystemTypes";
import { getFlyTime, getSpecByType, makeShip } from "./shipUtils";

export const getProductionForBuilding = (
  type: keyof typeof buildingConfig,
  level: number
): Partial<CombinedResources> => {
  const config = buildingConfig[type];
  const baseProduction = config?.production;

  const result: Partial<CombinedResources> = {};

  if (!baseProduction) return result;

  for (const key in baseProduction) {
    const resource = key as keyof CombinedResources;
    const baseValue = baseProduction[resource] ?? 0;
    const scaled = baseValue * Math.pow(PRODUCTION_INCREMENT, Math.max(0, level - 1));
    result[resource] = scaled;
  }

  return result;
};

export const getProduction = (hexes: Hex[]): Partial<CombinedResources> => {
  const result: Partial<CombinedResources> = {};

  for (const hex of hexes) {
    const building = hex.building;
    if (building) {
      const production = getProductionForBuilding(building.type, building.level);
      for (const key in production) {
        const typedKey = key as keyof CombinedResources;
        result[typedKey] = (result[typedKey] || 0) + (production[typedKey] || 0); // Si no hay producción, usamos 0
      }
    }
  }

  return result;
};

export const hasEnoughResources = (
  current: StoredResources,
  cost: Partial<CombinedResources>
): boolean => {
  const produced: Partial<CombinedResources> = current.production || {};
  const elapsedSeconds = (Date.now() - current.lastUpdate) / 1000;

  return Object.entries(cost).every(([key, value]) => {
    const typedKey = key as keyof Resources;
    const availableResources =
      (current.resources[typedKey] || 0) + (produced[typedKey] || 0) * elapsedSeconds;

    return availableResources >= (value || 0);
  });
};

export const generateRandomResources = (): Partial<Resources> => {
  const roll = () => (Math.random() < 0.4 ? Math.floor(Math.random() * 500 + 50) : 0);

  return {
    METAL: roll(),
    CRYSTAL: roll(),
    STONE: roll(),
  };
};

export const isCombinedResourcesType = (key: string): key is CombinedResourcesType => {
  return key in resourceEmojis;
};

export const sumCombinedResources = (
  a: CombinedResources,
  b: CombinedResources
): CombinedResources => {
  const result: CombinedResources = { ...a };

  (Object.keys(b) as CombinedResourcesType[]).forEach((key) => {
    const valueA = result[key] ?? 0;
    const valueB = (b[key] ?? 0) / 60;
    result[key] = valueA + valueB;
  });

  return result;
};

export const isSpecialResourceType = (key: string): key is (typeof SPECIAL_TYPES)[number] =>
  SPECIAL_TYPES.includes(key as (typeof SPECIAL_TYPES)[number]);

export function getAccumulatedResources(
  stored: StoredResources,
  until?: number
): { resources: Partial<CombinedResources>; delta: Partial<CombinedResources> } {
  const now = Date.now();
  const target = Math.min(until ?? now, now);
  const start = stored.lastUpdate ?? target;

  const elapsedMs = Math.max(0, target - start);
  const base: Partial<CombinedResources> = { ...stored.resources };

  if (elapsedMs === 0) {
    return { resources: base, delta: {} };
  }

  const elapsedSeconds = elapsedMs / 1000;
  const updated: Partial<CombinedResources> = { ...base };

  const prod = (stored.production ?? {}) as Partial<CombinedResources>;
  for (const key in prod) {
    const k = key as keyof CombinedResources;
    const rate = prod[k] || 0;
    if (!rate) continue;
    updated[k] = (updated[k] ?? 0) + rate * elapsedSeconds;
  }

  const delta: Partial<CombinedResources> = {};
  const keys = new Set([...Object.keys(updated), ...Object.keys(base)]);
  for (const k of keys) {
    const key = k as keyof CombinedResources;
    const before = base[key] || 0;
    const after = updated[key] || 0;
    const d = after - before;
    if (d !== 0) delta[key] = d;
  }
  return { resources: updated, delta };
}

export function getCargoResources(
  stored: StoredResources,
  until: number,
  capacity: number
): {
  cargoResources: Partial<CombinedResources>;
  remainingResources: Partial<CombinedResources>;
} {
  // Simula hasta 'until' (no limitar a Date.now())
  const target = until;
  const start = stored.lastUpdate ?? target;
  const elapsedMs = Math.max(0, target - start);

  const base: Partial<CombinedResources> = { ...stored.resources };
  const updated: Partial<CombinedResources> = { ...base };

  if (elapsedMs > 0) {
    const elapsedSeconds = elapsedMs / 1000;
    const prod = (stored.production ?? {}) as Partial<CombinedResources>;
    for (const key in prod) {
      const k = key as keyof CombinedResources;
      const rate = Number(prod[k] ?? 0);
      if (!rate) continue;
      updated[k] = Number(updated[k] ?? 0) + rate * elapsedSeconds;
    }
  }

  // --- CAPACIDAD GLOBAL ---
  let remainingCap = Math.max(0, capacity); // 👈 una sola variable global
  const cargoResources: Partial<CombinedResources> = {};
  const remainingResources: Partial<CombinedResources> = { ...updated }; // vamos restando

  const takeFrom = (key: CombinedResourcesType) => {
    if (remainingCap <= 0) return;
    const avail = Math.max(0, Number(remainingResources[key] ?? 0));
    if (avail <= 0) return;

    const take = Math.min(avail, remainingCap); // 👈 respeta el tope global
    if (take <= 0) return;

    cargoResources[key] = Number(cargoResources[key] ?? 0) + take;
    const left = avail - take;
    remainingResources[key] = left > 0 ? left : 0;
    if (left === 0) delete (remainingResources as any)[key]; // opcional
    remainingCap -= take; // 👈 reducimos el cupo global
  };

  // 1) Especiales
  for (const key of SPECIAL_TYPES as readonly SpecialResourceType[]) {
    takeFrom(key);
    if (remainingCap <= 0) break;
  }
  // 2) Normales
  if (remainingCap > 0) {
    for (const key of Array.from(NORMAL_KEYS) as ResourceType[]) {
      takeFrom(key);
      if (remainingCap <= 0) break;
    }
  }
  // 3) Cualquier otro recurso no priorizado
  if (remainingCap > 0) {
    const prioritized = new Set<string>([...SPECIAL_TYPES, ...Array.from(NORMAL_KEYS)]);
    for (const k of Object.keys(updated)) {
      if (prioritized.has(k)) continue;
      takeFrom(k as CombinedResourcesType);
      if (remainingCap <= 0) break;
    }
  }

  // (Opcional) Verificación defensiva
  const loaded = Object.values(cargoResources).reduce((s, v) => s + (Number(v) || 0), 0);
  if (loaded > capacity + 1e-9) {
    console.warn(`getCargoResources: loaded ${loaded} exceeds capacity ${capacity}`);
  }

  return { cargoResources, remainingResources };
}

export function checkCargoCollect(
  ships: Ship[],
  specs: ShipSpecsCtx,
  system: StarSystem
): {
  anyCargo: boolean;
  enoughCapacity: boolean;
  cargoCapacity: number;
  usedShips: ShipData[]; // [{ shipType, amount }]
  timeToCollect: number; // ms hasta que llega la más lenta que CARGA algo
} {
  const now = Date.now();
  const distance = (system as any).distance ?? 0;

  // Preparamos las "legs" (una por entrada de ships)
  const legs = ships
    .map((ship) => {
      const cfg = getSpecByType(ship.type, specs) as any;
      const cargoPerShip = Number(cfg?.cargo ?? 0) || 0;
      const speed = Number(cfg?.speed ?? 0) || 0;
      const amount = Math.max(0, Number((ship as any).amount ?? 1)) || 0;
      const cargoCapacity = cargoPerShip * amount;
      const arrival = now + getFlyTime(speed, distance);
      return {
        type: ship.type as Ship["type"],
        amount,
        cargoPerShip,
        cargoCapacity,
        speed,
        arrival,
      };
    })
    // Sólo naves que aportan capacidad y pueden llegar
    .filter((l) => l.amount > 0 && l.cargoPerShip > 0 && l.speed > 0)
    .sort((a, b) => a.arrival - b.arrival);

  const cargoCapacity = legs.reduce((acc, l) => acc + l.cargoCapacity, 0);
  const anyCargo = cargoCapacity > 0;

  if (!anyCargo || legs.length === 0) {
    return {
      anyCargo,
      enoughCapacity: false,
      cargoCapacity,
      usedShips: [],
      timeToCollect: 0,
    };
  }

  // Estado del sistema que avanza entre llegadas
  let sim: StoredResources = {
    resources: { ...(system.storedResources?.resources ?? {}) },
    lastUpdate: system.storedResources?.lastUpdate ?? now,
    production: { ...(system.storedResources?.production ?? {}) },
  };

  // Acumulamos naves realmente usadas por tipo
  const usedMap = new Map<Ship["type"], number>();
  let latestUsedArrival = 0;

  for (const leg of legs) {
    // Usa tu versión con 'capacity' que prioriza SPECIAL_TYPES y luego NORMAL_KEYS
    const { cargoResources, remainingResources } = getCargoResources(
      sim,
      leg.arrival,
      leg.cargoCapacity
    );

    const loaded = sumPositive(cargoResources ?? {});
    const shipsUsed =
      leg.cargoPerShip > 0 ? Math.min(leg.amount, Math.ceil(loaded / leg.cargoPerShip)) : 0;

    if (shipsUsed > 0) {
      usedMap.set(leg.type, (usedMap.get(leg.type) ?? 0) + shipsUsed);
      if (leg.arrival > latestUsedArrival) latestUsedArrival = leg.arrival;
    }

    sim = { ...sim, resources: remainingResources, lastUpdate: leg.arrival };
  }

  const leftover = sumPositive(sim.resources ?? {});
  const EPS = 1e-9;
  const enoughCapacity = leftover <= EPS;

  const usedShips: ShipData[] = Array.from(usedMap.entries()).map(([shipType, amount]) =>
    makeShip(shipType, amount)
  );

  const timeToCollect = latestUsedArrival > 0 ? Math.max(0, latestUsedArrival - now) : 0;

  return { anyCargo, enoughCapacity, cargoCapacity, usedShips, timeToCollect };

  function sumPositive(obj: Partial<CombinedResources>): number {
    let sum = 0;
    for (const k in obj) {
      const v = Number((obj as any)[k] ?? 0);
      if (v > 0) sum += v;
    }
    return sum;
  }
}
