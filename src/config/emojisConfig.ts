import { CombinedResourcesType } from "../types/resourceTypes";

export const resourceEmojis: Record<CombinedResourcesType, string> = {
  METAL: "🔩", // tornillo
  STONE: "⛏️", // roca
  ENERGY: "⚡", // rayo
  CRYSTAL: "💎", // diamante
  ILMENITA: "🌀", // roca densa / mineral
  AETHERIUM: "💠", // superficie lunar / polvo espacial
  THARNIO: "☢️", // material reactivo / radiactivo
  KAIROX: "🧬", // recurso biotecnológico o genético
  NEBULITA: "☁️", // energía o gas espacial, forma inestable
  //ADN: "🦠", // energía o gas espacial, forma inestable
};

export const shipStatsEmojis: Record<string, string> = {
  speed: "⏩", // Velocidad
  attack: "🎯", // Ataque
  defense: "🛡️", // Defensa
  hp: "❤️", // Vida
  cargo: "📦", // Carga
};

export function getEmojiForResource(key: CombinedResourcesType) {
  return resourceEmojis[key];
}
