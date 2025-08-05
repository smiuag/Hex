import { TerrainData, TerrainType } from "../types/terrainTypes";

export const terrainConfig: Record<TerrainType, TerrainData> = {
  WATER: {
    image: undefined,
    fallbackColor: "#1E90FF",
    label: "Agua",
  },
  BASE: {
    image: undefined,
    fallbackColor: "#fff",
    label: "Base Principal",
  },
  INITIAL: {
    image: undefined,
    fallbackColor: "#3d4465",
    label: "Sin terraformar",
  },
  BORDER: {
    image: undefined,
    fallbackColor: "#ffffff14",
    label: "Borde",
  },
  ANCIENT_ALIEN_STRUCTURES: {
    image: undefined,
    fallbackColor: "#ffffff14",
    label: "Ancient alien structures",
  },
};
