import AsyncStorage from "@react-native-async-storage/async-storage";
import { CombatResult, CombatResultsPage } from "../types/combatResultTypes";

type CombatIndexEntry = { id: string; date: number };

const COMBAT_INDEX_KEY = "combat:index:v1";
const COMBAT_PREFIX = "combat:result:";
const DEFAULT_PAGE_SIZE = 10;

// ------------ helpers de índice ------------
async function loadIndex(): Promise<CombatIndexEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(COMBAT_INDEX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveIndex(index: CombatIndexEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(COMBAT_INDEX_KEY, JSON.stringify(index));
  } catch {
    // swallow
  }
}

/** Inserta manteniendo orden por fecha DESC (fecha más reciente primero). */
function insertSortedDesc(index: CombatIndexEntry[], entry: CombatIndexEntry): CombatIndexEntry[] {
  // Evitar duplicados por id
  if (index.some((e) => e.id === entry.id)) return index;

  let lo = 0;
  let hi = index.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    // Queremos DESC: si mid.date < entry.date, insertamos más a la izquierda
    if (index[mid].date < entry.date) hi = mid;
    else lo = mid + 1;
  }
  const next = index.slice();
  next.splice(lo, 0, entry);
  return next;
}

// ------------ API pública ------------
/**
 * Inserta un CombatResult inmutable. Si el id ya existe en el índice, no duplica.
 */
export async function insertCombatResult(result: CombatResult): Promise<void> {
  const key = `${COMBAT_PREFIX}${result.id}`;
  try {
    // Guardar resultado completo (idempotente)
    await AsyncStorage.setItem(key, JSON.stringify(result));

    // Actualizar índice (ordenado por fecha desc)
    const index = await loadIndex();
    const next = insertSortedDesc(index, { id: result.id, date: result.date });
    if (next !== index) {
      await saveIndex(next);
    }
  } catch {
    // swallow
  }
}

/**
 * Borra toda la información de combates: resultados + índice.
 * Úsalo para "resetear partida".
 */
export async function resetCombatStorage(): Promise<void> {
  try {
    const index = await loadIndex();
    const keysToRemove = index.map((e) => `${COMBAT_PREFIX}${e.id}`);
    // Borrar resultados conocidos
    await Promise.all(keysToRemove.map((k) => AsyncStorage.removeItem(k)));
    // Borrar índice
    await AsyncStorage.removeItem(COMBAT_INDEX_KEY);
  } catch {
    // swallow
  }
}
/**
 * Recupera resultados con paginación, ordenados por fecha DESC.
 * page empieza en 1. pageSize por defecto 10.
 */
export async function getCombatResults(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<CombatResultsPage> {
  try {
    const index = await loadIndex();
    const total = index.length;

    // Normaliza página
    const safePage = Math.max(1, Math.min(page, Math.max(1, Math.ceil(total / pageSize) || 1)));
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;

    const slice = index.slice(start, end);
    const keys = slice.map((e) => `${COMBAT_PREFIX}${e.id}`);

    const raws = await Promise.all(keys.map((k) => AsyncStorage.getItem(k)));
    const items: CombatResult[] = [];
    const missingIds: string[] = [];

    raws.forEach((raw, i) => {
      const id = slice[i].id;
      if (!raw) {
        missingIds.push(id);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as CombatResult;
        items.push(parsed);
      } catch {
        // Si está corrupto, lo tratamos como missing
        missingIds.push(id);
      }
    });

    // Si detectamos ids huérfanos, compactamos el índice silenciosamente
    if (missingIds.length > 0) {
      const compacted = index.filter((e) => !missingIds.includes(e.id));
      await saveIndex(compacted);
    }

    const hasMore = end < total;
    const nextPage = hasMore ? safePage + 1 : null;

    return {
      items,
      total: total - missingIds.length,
      page: safePage,
      pageSize,
      hasMore,
      nextPage,
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      hasMore: false,
      nextPage: null,
    };
  }
}
