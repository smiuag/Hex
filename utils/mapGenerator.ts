import { StoredResources } from "../data/tipos";

export const generateHexGrid = (radius: number) => {
  const hexes = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r, terrain: "forest" });
    }
  }
  return hexes;
};

export const initialResources: StoredResources = {
  resources: {
    metal: 1000,
    energy: 50,
    crystal: 0,
  },
  lastUpdate: Date.now(),
};
