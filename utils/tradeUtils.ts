import { DIPLOMACY_TRADE_VALUE, Trade } from "@/src/types/eventTypes";
import { CombinedResources } from "@/src/types/resourceTypes";
import { ShipData } from "@/src/types/shipType";

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
  Math.max(1, Math.ceil(Math.pow(Math.random(), gamma) * max));

// crea líneas con totales
const makeLines = (pairs: Array<{ key: TradeKey; qty: number }>): TradeLine[] =>
  pairs.map(({ key, qty }) => {
    const unitCost = DIPLOMACY_TRADE_VALUE[key].COST;
    return { key, qty, unitCost, total: unitCost * qty };
  });

const totalValue = (lines: TradeLine[]) => lines.reduce((s, l) => s + l.total, 0);

// ----- rango según fairness
const clampFairness = (f: number) => Math.min(10, Math.max(0.5, f));
const getRatioRange = (fairness: number): { min: number; max: number } => {
  const f = clampFairness(fairness);
  if (f < 1) return { min: f, max: 1 }; // generoso
  if (f > 1) return { min: 1, max: f }; // injusto
  return { min: 0.95, max: 1.05 }; // justo (banda alcanzable)
};
const withinRange = (x: number, min: number, max: number) => x >= min && x <= max;

// --------- función principal con fairness
export const generateRandomTradeOffer = (
  fairness: number = 1, // 0.5..10
  maxTries: number = 40
): TradeOffer => {
  const { min, max } = getRatioRange(fairness);

  for (let attempt = 0; attempt < maxTries; attempt++) {
    // 1) OFRECE: 1–2 WANTED=true
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
    const offerValue = totalValue(offers);

    // 2) PIDE: 1–2 RESTRICTED=false
    const wantsCount = randInt(1, 2);
    // (Opcional) evitar pedir exactamente un item que también ofreces:
    const askPool = askableKeys.filter((k) => !offerKeys.includes(k));
    const wantsKeys = shuffle(askPool.length ? askPool : askableKeys).slice(0, wantsCount);

    // ratio objetivo dentro del rango [min, max]
    const targetRatio = min + Math.random() * (max - min);
    const targetAskValue = offerValue * targetRatio;

    let wantPairs: Array<{ key: TradeKey; qty: number }>;
    if (wantsKeys.length === 1) {
      const k = wantsKeys[0];
      const qty = Math.max(1, Math.round(targetAskValue / DIPLOMACY_TRADE_VALUE[k].COST));
      wantPairs = [{ key: k, qty }];
    } else {
      const [k1, k2] = wantsKeys;
      const s = 0.3 + Math.random() * 0.4; // [0.3,0.7]
      const q1 = Math.max(1, Math.round((targetAskValue * s) / DIPLOMACY_TRADE_VALUE[k1].COST));
      const q2 = Math.max(
        1,
        Math.round((targetAskValue * (1 - s)) / DIPLOMACY_TRADE_VALUE[k2].COST)
      );
      wantPairs = [
        { key: k1, qty: q1 },
        { key: k2, qty: q2 },
      ];
    }

    let wants = makeLines(wantPairs);
    let askValue = totalValue(wants);
    let ratio = askValue / offerValue;

    // Ajuste fino por redondeo para entrar en [min,max]
    let tweak = 0;
    while (!withinRange(ratio, min, max) && tweak < 20) {
      wants = wants.map((line) => {
        const cost = line.unitCost;
        if (ratio < min) {
          return { ...line, qty: line.qty + 1, total: cost * (line.qty + 1) };
        } else {
          const newQty = Math.max(1, line.qty - 1);
          return { ...line, qty: newQty, total: cost * newQty };
        }
      });
      askValue = totalValue(wants);
      ratio = askValue / offerValue;
      tweak++;
    }

    if (withinRange(ratio, min, max)) {
      return {
        offers,
        wants,
        offerValue: +offerValue.toFixed(2),
        askValue: +askValue.toFixed(2),
        ratio: +ratio.toFixed(3),
      };
    }
  }

  // fallback si no se logra en maxTries
  const fallbackKey = wantedKeys[0];
  const offers = makeLines([{ key: fallbackKey, qty: 1 }]);
  const wants = makeLines([{ key: askableKeys[0], qty: 1 }]);
  const offerValue = totalValue(offers);
  const askValue = totalValue(wants);
  return {
    offers,
    wants,
    offerValue,
    askValue,
    ratio: askValue / offerValue,
  };
};

const isResource = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "RESOURCE";
const isShip = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "SHIP";
const isSpecial = (k: TradeKey) => DIPLOMACY_TRADE_VALUE[k].TYPE === "SPECIAL";

const fmtLines = (lines: TradeLine[]) => lines.map((l) => `${l.qty}x ${l.key}`).join(" + ");

export const createTradeEventEffect = (fairness: number = 1): Trade => {
  const deal: TradeOffer = generateRandomTradeOffer(fairness);

  // Acumulamos recursos como diccionario y luego lo casteamos a Partial<CombinedResources>
  const resources: Record<string, number> = {};
  const ships: ShipData[] = [];
  let specialReward = false;

  // Lo que OFRECEN → el jugador LO RECIBE (positivo)
  for (const line of deal.offers) {
    if (isResource(line.key)) {
      resources[line.key] = (resources[line.key] ?? 0) + line.qty;
    } else if (isShip(line.key)) {
      // Ajusta este shape a tu ShipData real
      ships.push({ name: line.key as any, amount: line.qty } as unknown as ShipData);
    } else if (isSpecial(line.key)) {
      specialReward = true;
    }
  }

  // Lo que PIDEN → el jugador LO ENTREGA (negativo)
  for (const line of deal.wants) {
    if (isResource(line.key)) {
      resources[line.key] = (resources[line.key] ?? 0) - line.qty;
    }
    // Por reglas tuyas, wants no tendrá SHIP ni SPECIAL (RESTRICTED=true),
    // pero si algún día cambia, puedes decidir cómo tratarlo aquí.
  }

  const resourceChange: Partial<CombinedResources> | undefined = Object.keys(resources).length
    ? (resources as Partial<CombinedResources>)
    : undefined;

  const shipChange: ShipData[] | undefined = ships.length ? ships : undefined;

  const description =
    `Ofrece: ${fmtLines(deal.offers)} · Pide: ${fmtLines(deal.wants)} · ` +
    `ratio=${deal.ratio.toFixed(3)} (ask/offer)`;

  const tradeOffer: Trade = {
    specialReward: specialReward,
    resourceChange: resourceChange,
    shipChange: shipChange,
  };

  return tradeOffer;
};
