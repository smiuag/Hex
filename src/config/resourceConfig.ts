import { ResourceType, SpecialResourceType } from "../types/resourceTypes";

export const resourceEmojis: Record<ResourceType | SpecialResourceType, string> = {
  METAL: "🔩", // tornillo
  STONE: "⛏️", // roca
  ENERGY: "⚡", // rayo
  CRYSTAL: "💎", // diamante
  ILMENITA: "🪨", // roca densa / mineral
  REGOLITO: "🌑", // superficie lunar / polvo espacial
  THARNIO: "☢️", // material reactivo / radiactivo
  KAIROX: "🧬", // recurso biotecnológico o genético
  NEBULITA: "🌀", // energía o gas espacial, forma inestable
};
