import i18n, { Lang } from "@/i18n";
import { ConfigEntry, ConfigType, ConfigValueByKey, PlayerConfig } from "@/src/types/configTypes";
import { TOptions } from "i18next";

export const formatDuration = (timestamp: number, onlyMostSignificant?: boolean): string => {
  let diff = Math.abs(timestamp / 1000); // diferencia en segundos

  const days = Math.floor(diff / (60 * 60 * 24));
  diff %= 60 * 60 * 24;

  const hours = Math.floor(diff / (60 * 60));
  diff %= 60 * 60;

  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);

  const parts = [];
  if (days > 0) parts.push(`${days} d`);
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} s`);

  if (onlyMostSignificant) {
    return parts[0]; // Solo el más significativo
  }

  return parts.join(" ");
};

export const formatAmount = (value: number): string => {
  const format = (val: number, suffix: string): string => {
    const truncated = Math.floor(Math.abs(val) * 10) / 10; // Usamos Math.abs() para asegurar que solo formateamos el valor absoluto
    return (truncated % 1 === 0 ? truncated.toFixed(0) : truncated.toFixed(1)) + suffix;
  };

  const isNegative = value < 0; // Detectamos si el número es negativo

  if (Math.abs(value) >= 1_000_000_000) {
    return (isNegative ? "-" : "") + format(value / 1_000_000_000, "B");
  }
  if (Math.abs(value) >= 1_000_000) {
    return (isNegative ? "-" : "") + format(value / 1_000_000, "M");
  }
  if (Math.abs(value) >= 1_000) {
    return (isNegative ? "-" : "") + format(value / 1_000, "K");
  }
  return (isNegative ? "-" : "") + Math.ceil(value).toString();
};

export const getTimeRemaining = (duration: number, startedAt: number): number => {
  return Math.max(0, duration - (Date.now() - startedAt));
};

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _'\-]+$/;

export function validateName(name: string, t: (key: string, options?: object) => string): string[] {
  const errors: string[] = [];
  const trimmed = name.trim();
  if (trimmed.length < 3) errors.push(t("setup.errorShort"));
  if (trimmed && !NAME_REGEX.test(trimmed)) errors.push(t("setup.errorChars"));
  return errors;
}

export const normalizeLang = (l?: string): Lang =>
  l?.toLowerCase().startsWith("en") ? "en" : "es";

export function getCfg<K extends ConfigType>(
  cfg: PlayerConfig,
  key: K
): ConfigValueByKey[K] | undefined;
export function getCfg<K extends ConfigType>(
  cfg: PlayerConfig,
  key: K,
  fallback: ConfigValueByKey[K]
): ConfigValueByKey[K];

export function getCfg<K extends ConfigType>(
  cfg: PlayerConfig,
  key: K,
  fallback?: ConfigValueByKey[K]
) {
  const entry = cfg.find((c): c is ConfigEntry<K> => c.key === key);
  if (entry) return entry.value;
  return fallback as ConfigValueByKey[K] | undefined;
}

export function tSafeNS(ns: string) {
  return (key?: string | null, opts?: TOptions, fallback = ""): string => {
    if (!i18n.isInitialized) return fallback; // i18n aún no listo
    if (typeof key !== "string" || !key.trim()) return fallback;
    const t = i18n.getFixedT(i18n.resolvedLanguage || i18n.language, ns);
    return t(key, { defaultValue: key, ...(opts ?? {}) });
  };
}

export function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function totalAmount(list: ReadonlyArray<{ amount: number }>) {
  return list.reduce((acc, s) => acc + s.amount, 0);
}
