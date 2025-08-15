import { Lang } from "@/i18n";
import { PlayerConfig } from "@/src/types/configTypes";

export const formatDuration = (timestamp: number, onlyMostSignificant?: boolean): string => {
  let diff = Math.abs(timestamp / 1000); // diferencia en segundos

  const days = Math.floor(diff / (60 * 60 * 24));
  diff %= 60 * 60 * 24;

  const hours = Math.floor(diff / (60 * 60));
  diff %= 60 * 60;

  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

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

export const getCfg = (playerConfig: PlayerConfig, key: string) =>
  playerConfig.find((c) => c.key === key)?.value ?? "";
