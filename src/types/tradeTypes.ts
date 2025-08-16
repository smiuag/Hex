import { ImageSourcePropType } from "react-native";

export type TradeKind = "RESOURCE" | "SHIP" | "SPECIAL";
export type PricingEntry = { TYPE: TradeKind; COST: number };
export type PricingMap = Record<string, PricingEntry>;
export type Balances = Record<string, number>;
export type Meta = {
  name?: string;
  icon?: string;
  image?: string;
  imageSource?: ImageSourcePropType;
};

export type BMEntry = { TYPE: string; KIND: TradeKind; OFFERED?: number; WANTED?: number };
export type BMMap = Record<string, BMEntry>;

export const BLACKMARKET_TRADE_VALUE = {
  STONE: { TYPE: "STONE", KIND: "RESOURCE", OFFERED: 3, WANTED: 1 },
  METAL: { TYPE: "METAL", KIND: "RESOURCE", OFFERED: 4, WANTED: 1 },
  CRYSTAL: { TYPE: "CRYSTAL", KIND: "RESOURCE", OFFERED: 5, WANTED: 1 },
  ILMENITA: { TYPE: "ILMENITA", KIND: "RESOURCE", OFFERED: 1000, WANTED: 150 },
  AETHERIUM: { TYPE: "AETHERIUM", KIND: "RESOURCE", OFFERED: 1000, WANTED: 150 },
  THARNIO: { TYPE: "THARNIO", KIND: "RESOURCE", OFFERED: 1000, WANTED: 150 },
  KAIROX: { TYPE: "KAIROX", KIND: "RESOURCE", OFFERED: 1500, WANTED: 150 },
  NEBULITA: { TYPE: "NEBULITA", KIND: "RESOURCE", OFFERED: 700, WANTED: 100 },
  ASSAULTBATTLESHIP: { TYPE: "ASSAULTBATTLESHIP", KIND: "SHIP", OFFERED: 6000000 },
  STARCARRIER: { TYPE: "STARCARRIER", KIND: "SHIP", OFFERED: 6500000 },
  HEAVYASSAULTSHIP: { TYPE: "HEAVYASSAULTSHIP", KIND: "SHIP", OFFERED: 7000000 },
  ORBITALASSAULTSHIP: { TYPE: "ORBITALASSAULTSHIP", KIND: "SHIP", OFFERED: 8000000 },
  PLANETARYDESTROYER: { TYPE: "PLANETARYDESTROYER", KIND: "SHIP", OFFERED: 9000000 },
  NEW_RECIPE: { TYPE: "NEW_RECIPE", KIND: "SPECIAL", OFFERED: 30000000 },
};
