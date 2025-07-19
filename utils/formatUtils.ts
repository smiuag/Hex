export const formatDuration = (
  timestamp: number,
  onlyMostSignificant?: boolean
): string => {
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
    const truncated = Math.floor(val * 10) / 10;
    return (
      (truncated % 1 === 0 ? truncated.toFixed(0) : truncated.toFixed(1)) +
      suffix
    );
  };

  if (value >= 1_000_000_000) {
    return format(value / 1_000_000_000, "B");
  }
  if (value >= 1_000_000) {
    return format(value / 1_000_000, "M");
  }
  if (value >= 1_000) {
    return format(value / 1_000, "K");
  }
  return value.toString();
};
