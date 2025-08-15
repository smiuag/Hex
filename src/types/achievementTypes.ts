export type AchievementCategory =
  | "PROGRESSION"
  | "ECONOMY"
  | "SCIENCE"
  | "TRADE"
  | "EXPLORATION"
  | "COMBAT"
  | "META";

export type AchievementType =
  // PROGRESSION
  | "TUTORIAL_COMPLETE"
  | "ESTABLISH_COLONY"
  | "BASE_LEVEL_2"
  | "BASE_LEVEL_3"
  | "SHIPS_BUILT"
  | "SYSTEMS_SCANNED"
  | "ESTABLISH_EMBASSY"
  | "FIRST_SYSTEM_EXPLORED"
  | "STARPORT_BUILT"
  | "DEFENSES_ONLINE"
  // ECONOMY
  | "MINERALS_COLLECTED"
  | "ENERGY_PRODUCED_TOTAL"
  | "SPECIAL_RESOURCES_COLLECTED_TOTAL"
  | "QUARRIES_BUILT_TOTAL"
  | "METALLURGY_BUILT_TOTAL"
  | "BUILDINGS_UPGRADED_TOTAL"
  // SCIENCE
  | "FIRST_LAB"
  | "FIRST_RESEARCH"
  | "ALIEN_TECH_ANALYZED"
  | "RESEARCH_PROJECTS_COMPLETED"
  // TRADE
  | "FIRST_TRADE"
  | "TRADES_COMPLETED"
  | "TRADE_PARTNERS"
  | "SHIPS_TRADED"
  | "NO_FRIENDS"
  // EXPLORATION
  | "TILES_TERRAFORMED"
  | "H2O_FOUND"
  | "ALIEN_TECH_FOUND"
  | "SYSTEMS_EXPLORED"
  | "MAX_LEVEL_ANTENNA"
  // COMBAT
  | "FIRST_BATTLE_WON"
  | "BATTLES_WON"
  | "NO_LOSSES_BATTLE"
  // META
  | "COLLECT_ALL_SHIPS"
  | "ALL_RESEARCH_COMPLETE";

export type MetricCounterKey =
  | "ESTABLISH_COLONY"
  | "SHIPS_BUILT"
  | "SYSTEMS_SCANNED"
  | "MINERALS_COLLECTED"
  | "ENERGY_PRODUCED"
  | "SPECIAL_RESOURCES_COLLECTED_TOTAL"
  | "QUARRIES_BUILT"
  | "METALLURGY_BUILT"
  | "BUILDINGS_UPGRADED"
  | "RESEARCH_PROJECTS_COMPLETED"
  | "TRADES_COMPLETED"
  | "SHIPS_TRADED"
  | "TILES_TERRAFORMED"
  | "SYSTEMS_EXPLORED"
  | "BATTLES_WON";

export type MetricSetKey = "TRADE_PARTNERS" | "SHIP_BLUEPRINTS_OWNED";

export type MetricKey = MetricCounterKey | MetricSetKey;

// ===== 3) Config básica de logros =====
export type ProgressMetric =
  | { kind: "boolean" }
  | { kind: "counter"; key: MetricCounterKey }
  | { kind: "set"; key: MetricSetKey };

export type AchievementTier = {
  tier: number;
  threshold: number;
  points?: number;
  icon?: string;
  titleKey: string;
  descKey: string;
  secretTitleKey?: string;
  secretDescKey?: string;
};

export type AchievementConfig = {
  id: AchievementType;
  category: AchievementCategory;
  secret?: boolean;
  repeatable?: boolean;
  metric: ProgressMetric;
  tiers: AchievementTier[];
  dependsOn?: AchievementType[];
};

// ===== 4) Estado del jugador =====
export type PlayerAchievement = {
  id: AchievementType;
  progress: number;
  unlockedTier: number;
  claimedTier: number;
  setItems?: string[];
  firstUnlockAt?: number;
  lastProgressAt?: number;
};

// ===== 5) Eventos TIPADOS =====
export type IncrementEvent = { type: "increment"; key: MetricCounterKey; amount: number };
export type AddToSetEvent = { type: "addToSet"; key: MetricSetKey; itemId: string };

// Para booleanos puedes disparar por id (preferido) o, si mantienes compat,
// por "key" que sea el propio AchievementType:
export type TriggerEvent = { type: "trigger"; key: AchievementType };

export type AchievementEvent = IncrementEvent | AddToSetEvent | TriggerEvent;

// ===== 6) Otros =====
export type ToastPayload = {
  id: AchievementType;
  tier: number;
  titleKey: string;
  descKey: string;
  icon?: string;
};

export const CATEGORY_ICON: Record<AchievementCategory, string> = {
  PROGRESSION: "🧭",
  ECONOMY: "🏗️",
  SCIENCE: "🔬",
  TRADE: "📦",
  EXPLORATION: "🛰️",
  COMBAT: "⚔️",
  META: "🏆",
};

export type ProgressInfo = {
  progress: number;
  unlockedTier: number;
  claimedTier: number;
  nextThreshold: number;
  ratio: number;
};

export const toProgressInfo = (raw?: Partial<ProgressInfo> | null): ProgressInfo => ({
  progress: raw?.progress ?? 0,
  unlockedTier: raw?.unlockedTier ?? 0,
  claimedTier: raw?.claimedTier ?? 0,
  nextThreshold: raw?.nextThreshold ?? 0,
  ratio: raw?.ratio ?? 0,
});

// (Opcional) reporter tipado
export type AchievementsReporter = {
  inc: (key: MetricCounterKey, delta?: number) => void;
  setTrue: (id: AchievementType) => void;
  addToSet?: (key: MetricSetKey, itemId: string) => void;
};

export type SerializeFn = <T>(task: () => Promise<T> | T) => Promise<T>;

export type UseAchievementsOpts = {
  toast?: (p: ToastPayload) => void;
};
