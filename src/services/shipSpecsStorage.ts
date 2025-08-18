// src/storage/shipSpecsStorage.ts
import { shipConfig } from "@/src/config/shipConfig";
import type {
  CustomShipSpec,
  CustomShipTypeId,
  CustomSpecMap,
  ShipDesignAttempt,
  ShipSpecsCtx,
} from "@/src/types/shipType";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cambia el sufijo si haces cambios incompatibles en el esquema
const CUSTOM_SPECS_KEY = "SHIP_CUSTOM_SPECS";
const DESIGN_ACTIVE_KEY = "SHIP_DESIGN_ACTIVE_ATTEMPT";
const DESIGN_HISTORY_KEY = "SHIP_DESIGN_ATTEMPT_HISTORY";

/** Parse seguro con fallback */
function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Carga todas las specs custom del jugador (map por id). Si no hay, devuelve {} */
export async function loadCustomSpecs(): Promise<CustomSpecMap> {
  const raw = await AsyncStorage.getItem(CUSTOM_SPECS_KEY);

  // Soporta una posible forma antigua en array y migra a map
  const data = safeParse<CustomSpecMap | CustomShipSpec[] | null>(raw, {} as CustomSpecMap);
  if (Array.isArray(data)) {
    const map: CustomSpecMap = {};
    for (const s of data) map[s.id] = s;
    await AsyncStorage.setItem(CUSTOM_SPECS_KEY, JSON.stringify(map));
    return map;
  }
  return (data ?? {}) as CustomSpecMap;
}

/** Sobrescribe todas las specs custom */
export async function saveCustomSpecs(map: CustomSpecMap): Promise<void> {
  await AsyncStorage.setItem(CUSTOM_SPECS_KEY, JSON.stringify(map));
}

/** Inserta/actualiza una spec custom y devuelve el map resultante */
export async function upsertCustomSpec(spec: CustomShipSpec): Promise<CustomSpecMap> {
  const map = await loadCustomSpecs();
  map[spec.id] = spec;
  await saveCustomSpecs(map);
  return map;
}

/** Actualiza parcialmente una spec (patch). Devuelve la spec actualizada o null si no existe */
export async function patchCustomSpec(
  id: CustomShipTypeId,
  patch: Partial<CustomShipSpec>
): Promise<CustomShipSpec | null> {
  const map = await loadCustomSpecs();
  const prev = map[id];
  if (!prev) return null;
  const next: CustomShipSpec = { ...prev, ...patch };
  map[id] = next;
  await saveCustomSpecs(map);
  return next;
}

/** Elimina una spec por id y devuelve el map resultante */
export async function deleteCustomSpec(id: CustomShipTypeId): Promise<CustomSpecMap> {
  const map = await loadCustomSpecs();
  if (map[id]) {
    delete map[id];
    await saveCustomSpecs(map);
  }
  return map;
}

/** Borra todas las specs custom */
export async function clearCustomSpecs(): Promise<void> {
  await AsyncStorage.removeItem(CUSTOM_SPECS_KEY);
}

/** Devuelve el contexto combinado (builtin + custom) listo para tus helpers getSpecByType, etc. */
export async function loadShipSpecsCtx(): Promise<ShipSpecsCtx> {
  const customById = await loadCustomSpecs();
  return { builtin: shipConfig, customById };
}

export async function loadActiveDesignAttempt(): Promise<ShipDesignAttempt | null> {
  const raw = await AsyncStorage.getItem(DESIGN_ACTIVE_KEY);
  return raw ? (JSON.parse(raw) as ShipDesignAttempt) : null;
}
export async function saveActiveDesignAttempt(a: ShipDesignAttempt | null): Promise<void> {
  if (!a) await AsyncStorage.removeItem(DESIGN_ACTIVE_KEY);
  else await AsyncStorage.setItem(DESIGN_ACTIVE_KEY, JSON.stringify(a));
}

export async function loadDesignHistory(): Promise<ShipDesignAttempt[]> {
  const raw = await AsyncStorage.getItem(DESIGN_HISTORY_KEY);
  return raw ? (JSON.parse(raw) as ShipDesignAttempt[]) : [];
}
export async function saveDesignHistory(items: ShipDesignAttempt[]): Promise<void> {
  await AsyncStorage.setItem(DESIGN_HISTORY_KEY, JSON.stringify(items));
}

export async function appendDesignHistory(item: ShipDesignAttempt): Promise<void> {
  const prev = await loadDesignHistory();
  prev.push(item);
  await saveDesignHistory(prev);
}

export async function clearActiveDesignAttempt(): Promise<void> {
  await AsyncStorage.removeItem(DESIGN_ACTIVE_KEY);
}

// NUEVO: limpiar historial
export async function clearDesignHistory(): Promise<void> {
  await AsyncStorage.removeItem(DESIGN_HISTORY_KEY);
}
