import { ResourceType, SpecialResourceType } from "../types/resourceTypes";

export const resourceEmojis: Record<ResourceType | SpecialResourceType, string> = {
  METAL: "🔩", // tornillo
  STONE: "⛏️", // roca
  ENERGY: "⚡", // rayo
  CRYSTAL: "💎", // diamante
  ILMENITA: "🪨", // roca densa / mineral
  AETHERIUM: "💠", // superficie lunar / polvo espacial
  THARNIO: "☢️", // material reactivo / radiactivo
  KAIROX: "🧬", // recurso biotecnológico o genético
  NEBULITA: "🌀", // energía o gas espacial, forma inestable
  ADN: "🦠", // energía o gas espacial, forma inestable
};

export const shipStatsEmojis: Record<string, string> = {
  speed: "⏩", // Velocidad
  attack: "🎯", // Ataque
  defense: "🛡️", // Defensa
  health: "❤️", // Vida
};
