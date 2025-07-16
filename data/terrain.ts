import { TerrainType } from "./tipos";

type TerrainConfig = {
  image?: number; // require(...) devuelve un número
  fallbackColor: string;
  label?: string;
};

export const terrainConfig: Record<TerrainType, TerrainConfig> = {
  forest: {
    image: undefined,
    fallbackColor: "#228B22",
    label: "Bosque",
  },
  desert: {
    image: undefined,
    fallbackColor: "#EDC9Af",
    label: "Desierto",
  },
  water: {
    image: undefined,
    fallbackColor: "#1E90FF",
    label: "Agua",
  },
  mountain: {
    image: undefined,
    fallbackColor: "#A9A9A9",
    label: "Montaña",
  },
  base: {
    image: undefined,
    fallbackColor: "#fff",
    label: "Base Principal",
  },
  ice: {
    image: undefined,
    fallbackColor: "#B0E0E6",
    label: "Hielo",
  },
  lava: {
    image: undefined,
    fallbackColor: "#FF4500",
    label: "Lava",
  },
  swamp: {
    image: undefined,
    fallbackColor: "#556B2F",
    label: "Pantano",
  },
  plains: {
    image: undefined,
    fallbackColor: "#c6e68eff",
    label: "Plains",
  },
  initial: {
    image: undefined,
    fallbackColor: "#3d4465",
    label: "Sin terraformar",
  },
  border: {
    image: undefined,
    fallbackColor: "#ffffff14",
    label: "Borde",
  },
};
