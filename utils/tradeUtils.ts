import { DIPLOMACY_TRADE_VALUE, Trade } from "@/src/types/eventTypes";
import { CombinedResources } from "@/src/types/resourceTypes";
import { Ship, ShipData } from "@/src/types/shipType";

type TradeKey = keyof typeof DIPLOMACY_TRADE_VALUE;

type TradeLine = {
  key: TradeKey;
  qty: number;
  unitCost: number;
  total: number;
};

type TradeOffer = {
  offers: TradeLine[];
  wants: TradeLine[];
  offerValue: number;
  askValue: number;
  ratio: number; // askValue / offerValue
};

// ---- utils
const keys = Object.keys(DIPLOMACY_TRADE_VALUE) as TradeKey[];
const wantedKeys = keys.filter((k) => DIPLOMACY_TRADE_VALUE[k].WANTED);
const askableKeys = keys.filter((k) => !DIPLOMACY_TRADE_VALUE[k].RESTRICTED);

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// selección ponderada por CHANCE
const pickWeightedByChance = (pool: TradeKey[]): TradeKey | undefined => {
  const weights = pool.map((k) => Math.max(0, DIPLOMACY_TRADE_VALUE[k].CHANCE ?? 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return pool.length ? pool[randInt(0, pool.length - 1)] : undefined;
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
};

// Cantidad 1..MAX con sesgo a pequeñas
const biasedQty = (max: number, gamma = 2) =>
  Math.max(1, Math.ceil(Math.pow(Math.random(), gamma) * Math.max(1, max)));

// crea líneas con totales
const makeLines = (pairs: Array<{ key: TradeKey; qty: number }>): TradeLine[] =>
  pairs.map(({ key, qty }) => {
    const unitCost = DIPLOMACY_TRADE_VALUE[key].COST;
    return { key, qty, unitCost, total: unitCost * qty };
  });

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

// ——— helpers de recálculo
const mapQty = (line: TradeLine, qty: number): TradeLine => ({
  ...line,
  qty,
  total: line.unitCost * qty,
});

const recompute = (offers: TradeLine[], wants: TradeLine[]) => {
  const offerValue = offers.reduce((s, l) => s + l.total, 0);
  const askValue = wants.reduce((s, l) => s + l.total, 0);
  const ratio = offerValue > 0 ? askValue / offerValue : 0;
  return {
    offerValue: +offerValue.toFixed(2),
    askValue: +askValue.toFixed(2),
    ratio: +ratio.toFixed(3),
  };
};

// tipos/flags
const isResource = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "RESOURCE";
const isShip = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "SHIP";
const isSpecial = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "SPECIAL";

// holdings
function getHoldingOfShip(currentShips: Ship[], key: string): number {
  return currentShips.find((s) => String(s.type) === key)?.amount ?? 0;
}

function holdingOfKey(
  key: TradeKey,
  currentResources: Partial<CombinedResources>,
  currentShips: Ship[]
): number {
  if (isResource(key)) return (currentResources as any)[key] ?? 0;
  if (isShip(key)) return getHoldingOfShip(currentShips, key);
  return 0; // SPECIAL no tiene holdings
}

// =========================
//   generateRandomTradeOffer
// =========================
// NOTA: fairness NO se usa aquí para wants/offers base; se aplicará luego a OFFERS.
export const generateRandomTradeOffer = (
  fairness: number = 1, // mantenido en la firma por compatibilidad
  maxTries: number = 40
): TradeOffer => {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    // 1) OFRECE: 1–2 items con WANTED=true
    const targetOfferCount = randInt(1, 2);
    const included = wantedKeys.filter(
      (k) => Math.random() < (DIPLOMACY_TRADE_VALUE[k].CHANCE ?? 0)
    );
    let offerKeys = shuffle(included).slice(0, targetOfferCount);
    while (offerKeys.length < targetOfferCount) {
      const remaining = wantedKeys.filter((k) => !offerKeys.includes(k));
      const next = pickWeightedByChance(remaining);
      if (!next) break;
      offerKeys.push(next);
    }
    if (offerKeys.length === 0) {
      const fallback = pickWeightedByChance(wantedKeys);
      if (!fallback) throw new Error("No hay items WANTED disponibles.");
      offerKeys = [fallback];
    }
    const offerPairs = offerKeys.map((key) => {
      const mx = DIPLOMACY_TRADE_VALUE[key].MAX ?? 1;
      return { key, qty: biasedQty(mx) };
    });
    const offers = makeLines(offerPairs);

    // 2) PIDE: 1–2 items con RESTRICTED=false (independiente de fairness)
    const wantsCount = randInt(1, 2);
    const askPool = askableKeys.filter((k) => !offerKeys.includes(k));
    const wantsKeys = shuffle(askPool.length ? askPool : askableKeys).slice(0, wantsCount);

    const wantPairs: Array<{ key: TradeKey; qty: number }> =
      wantsKeys.length === 1
        ? [
            {
              key: wantsKeys[0],
              qty: biasedQty(DIPLOMACY_TRADE_VALUE[wantsKeys[0]].MAX ?? 10),
            },
          ]
        : (() => {
            const [k1, k2] = wantsKeys;
            return [
              { key: k1, qty: biasedQty(DIPLOMACY_TRADE_VALUE[k1].MAX ?? 10) },
              { key: k2, qty: biasedQty(DIPLOMACY_TRADE_VALUE[k2].MAX ?? 10) },
            ];
          })();

    const wants = makeLines(wantPairs);
    const { offerValue, askValue, ratio } = recompute(offers, wants);

    if (offers.length && wants.length) {
      return {
        offers,
        wants,
        offerValue,
        askValue,
        ratio,
      };
    }
  }

  // fallback si no se logra en maxTries
  const fallbackKey = wantedKeys[0];
  const offers = makeLines([{ key: fallbackKey, qty: 1 }]);
  const wants = makeLines([{ key: askableKeys[0], qty: 1 }]);
  const { offerValue, askValue, ratio } = recompute(offers, wants);
  return { offers, wants, offerValue, askValue, ratio };
};

// =========================
//  clampWantsToHoldings
// =========================
// Limita WANTS SIEMPRE a [0.5×, 2×] de los holdings.
// Si una línea queda en 0 porque no tienes ese ítem, PRUEBA con otros askables
// (recursos o naves) que sí tengas, evitando duplicados.
// Si tras el proceso no hay wants pero el jugador tiene algo, sintetiza una línea válida.
function clampWantsToHoldings(
  deal: TradeOffer,
  currentResources: Partial<CombinedResources>,
  currentShips: Ship[]
): TradeOffer {
  const MIN_R = 0.5;
  const MAX_R = 2;

  const used = new Set<TradeKey>();
  const result: TradeLine[] = [];

  const tryAddLine = (key: TradeKey) => {
    const cur = holdingOfKey(key, currentResources, currentShips);
    if (cur <= 0 || used.has(key)) return false;
    const min = Math.floor(cur * MIN_R);
    const max = Math.ceil(cur * MAX_R);
    const qty = clamp(
      // punto medio para estabilidad; puedes cambiar a random en [min,max]
      Math.max(1, Math.floor((min + max) / 2)),
      min,
      max
    );
    if (qty > 0) {
      used.add(key);
      const unitCost = DIPLOMACY_TRADE_VALUE[key].COST;
      result.push({ key, qty, unitCost, total: unitCost * qty });
      return true;
    }
    return false;
  };

  // 1) Procesa las líneas originales
  for (const line of deal.wants) {
    const key = line.key;
    const cur = holdingOfKey(key, currentResources, currentShips);
    const min = Math.floor(cur * MIN_R);
    const max = Math.ceil(cur * MAX_R);
    const qty = clamp(line.qty, min, max);

    if (qty > 0 && cur > 0 && !used.has(key)) {
      used.add(key);
      result.push(mapQty(line, qty));
      continue;
    }

    // Si no es válido (no tienes o queda 0), prueba otros askables que sí tengas
    const candidates = shuffle(
      askableKeys.filter((k) => !used.has(k) && holdingOfKey(k, currentResources, currentShips) > 0)
    );

    let placed = false;
    for (const candidate of candidates) {
      if (tryAddLine(candidate)) {
        placed = true;
        break;
      }
    }

    // si no encontró reemplazo, omite esta línea
    if (!placed) {
      // no push
    }
  }

  // 2) Si quedó vacío pero el jugador tiene algo, sintetiza 1 línea válida
  if (result.length === 0) {
    const candidates = shuffle(
      askableKeys.filter((k) => holdingOfKey(k, currentResources, currentShips) > 0)
    );
    if (candidates.length > 0) {
      tryAddLine(candidates[0]);
    }
  }

  const { offerValue, askValue, ratio } = recompute(deal.offers, result);
  return { ...deal, wants: result, offerValue, askValue, ratio };
}

// =========================
//  applyFairnessToOffers
// =========================
// Aplica fairness SOLO a OFFERS: offersValue = wantsValue / fairness
function applyFairnessToOffers(deal: TradeOffer, fairness: number): TradeOffer {
  const wantsV = deal.askValue; // ya calculado y coherente
  const targetOffersV = wantsV / Math.max(0.000001, fairness);

  const baseOffers = deal.offers.filter((l) => !isSpecial(l.key)); // escalables
  const specials = deal.offers.filter((l) => isSpecial(l.key)); // no escalables

  const currentOffersV = baseOffers.reduce((s, l) => s + l.total, 0) || 0.000001;
  const k = targetOffersV / currentOffersV;

  let scaledOffers = baseOffers
    .map((l) => mapQty(l, Math.max(0, Math.round(l.qty * k))))
    .filter((l) => l.qty > 0);

  // Salvavidas: si target>0 y por redondeo quedó vacío o no había baseOffers,
  // sintetiza una oferta barata de wantedKeys para cumplir mínimo.
  if (targetOffersV > 0 && scaledOffers.length === 0) {
    const cheapestWanted =
      [...wantedKeys].sort(
        (a, b) => DIPLOMACY_TRADE_VALUE[a].COST - DIPLOMACY_TRADE_VALUE[b].COST
      )[0] ?? wantedKeys[0];

    const unit = DIPLOMACY_TRADE_VALUE[cheapestWanted].COST || 1;
    const qty = Math.max(1, Math.round(targetOffersV / unit));
    scaledOffers = makeLines([{ key: cheapestWanted, qty }]);
  }

  const offers = [...scaledOffers, ...specials];
  const { offerValue, askValue, ratio } = recompute(offers, deal.wants);
  return { ...deal, offers, offerValue, askValue, ratio };
}

// =========================
//  createTradeEventEffect (exportada)
// =========================
export const createTradeEventEffect = (
  currentResources: Partial<CombinedResources>,
  currentShips: Ship[],
  fairness: number = 1
): Trade => {
  // 0) Genera base (independiente de fairness)
  const base: TradeOffer = generateRandomTradeOffer(fairness);

  // 1) Limita lo que te piden a [0.5×, 2×] de tus holdings,
  //    intentando SIEMPRE encontrar claves que SÍ tengas (recursos o naves).
  const wantsBound = clampWantsToHoldings(base, currentResources, currentShips);

  // 2) Aplica fairness SOLO a lo que te ofrecen
  const deal = applyFairnessToOffers(wantsBound, fairness);

  // 3) Construye el Trade final
  const resources: Record<string, number> = {};
  const ships: ShipData[] = [];
  let specialReward = false;

  // Ofrece → suman (positivos)
  for (const line of deal.offers) {
    if (isResource(line.key)) {
      resources[line.key] = (resources[line.key] ?? 0) + line.qty;
    } else if (isShip(line.key)) {
      ships.push({
        type: line.key as unknown as ShipData["type"],
        amount: line.qty,
      });
    } else if (isSpecial(line.key)) {
      specialReward = true;
    }
  }

  // Pide → restan (negativos, ya limitados)
  for (const line of deal.wants) {
    if (isResource(line.key)) {
      resources[line.key] = (resources[line.key] ?? 0) - line.qty;
    } else if (isShip(line.key)) {
      ships.push({
        type: line.key as unknown as ShipData["type"],
        amount: -line.qty,
      });
    }
  }

  const resourceChange: Partial<CombinedResources> | undefined = Object.keys(resources).length
    ? (resources as Partial<CombinedResources>)
    : undefined;

  const shipChange: ShipData[] | undefined = ships.length ? ships : undefined;

  return { specialReward, resourceChange, shipChange };
};
