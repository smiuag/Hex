import { Dimensions } from "react-native";
import { BuildingType } from "../src/types/buildingTypes";
import { Hex } from "../src/types/hexTypes";
import { StoredResources } from "../src/types/resourceTypes";
import { generateRandomResources } from "./resourceUtils";

export const axialToPixel = (q: number, r: number, hexSize: number) => {
  const x = hexSize * Math.sqrt(3) * (q + r / 2);
  const y = hexSize * 1.5 * r;
  return { x, y };
};

export const getHexPoints = (x: number, y: number, hexSize: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const px = x + hexSize * Math.cos(angle);
    const py = y + hexSize * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(" ");
};

export function pixelToAxial(x: number, y: number, hexSize: number) {
  if (isNaN(x) || isNaN(y)) return null;

  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / hexSize;
  const r = ((2 / 3) * y) / hexSize;
  return hexRound(q, r, hexSize);
}

function hexRound(q: number, r: number, hexSize: number) {
  let s = -q - r;

  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
}

// Pantalla y SVG
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const SCREEN_DIMENSIONS = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SVG_WIDTH: SCREEN_WIDTH * 3,
  SVG_HEIGHT: SCREEN_HEIGHT * 3,
  CENTER_X: (SCREEN_WIDTH * 3) / 2,
  CENTER_Y: (SCREEN_HEIGHT * 3) / 2,
};

export const getInitialResources = (): StoredResources => ({
  resources: {
    METAL: 0,
    ENERGY: 0,
    CRYSTAL: 0,
    STONE: 0,
  },
  lastUpdate: Date.now(),
  production: {
    METAL: 10,
    ENERGY: 5,
    CRYSTAL: 0,
    STONE: 10,
  },
});

export const axialDistance = (a: { q: number; r: number }, b: { q: number; r: number }): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

export const generateInitialHexMap = (): Hex[] => {
  // Base en forma de triángulo apuntando hacia abajo (vértice superior)
  const triangleGroup = [
    { q: 0, r: 0 }, // Vértice superior (líder)
    { q: -1, r: 1 }, // Abajo izquierda
    { q: 0, r: 1 }, // Abajo derecha
  ];

  const isInList = (q: number, r: number, list: { q: number; r: number }[]): boolean =>
    list.some((h) => h.q === q && h.r === r);

  const isBaseHex = (q: number, r: number): boolean => isInList(q, r, triangleGroup);

  const getNeighbors = (q: number, r: number): { q: number; r: number }[] => [
    { q: q + 1, r: r },
    { q: q - 1, r: r },
    { q: q, r: r + 1 },
    { q: q, r: r - 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
  ];

  // A partir de los 3 hexágonos base, expandimos hacia sus vecinos
  const initialHexesSet = new Set<string>();
  const borderHexesSet = new Set<string>();

  const stringify = (q: number, r: number) => `${q},${r}`;

  // Recoger los vecinos de los base
  triangleGroup.forEach(({ q, r }) => {
    getNeighbors(q, r).forEach(({ q: nq, r: nr }) => {
      if (!isBaseHex(nq, nr)) {
        initialHexesSet.add(stringify(nq, nr));
      }
    });
  });

  // Recoger vecinos de los "initial"
  Array.from(initialHexesSet).forEach((coord) => {
    const [q, r] = coord.split(",").map(Number);
    getNeighbors(q, r).forEach(({ q: nq, r: nr }) => {
      const key = stringify(nq, nr);
      if (!initialHexesSet.has(key) && !isBaseHex(nq, nr)) {
        borderHexesSet.add(key);
      }
    });
  });

  // Fusionar todo en un array de hexágonos
  const hexMap: Hex[] = [];

  // Añadir base hexes
  triangleGroup.forEach(({ q, r }) => {
    hexMap.push({
      q,
      r,
      terrain: "base",
      isVisible: true,
      isTerraformed: true,
      isRadius: false,
      building: q === 0 && r === 0 ? { type: "BASE" as BuildingType, level: 1 } : null,
      construction: undefined,
      previousBuilding: null,
      groupId: "triangleStructure",
      isGroupLeader: q === 0 && r === 0,
      resources: generateRandomResources(),
    });
  });

  // Añadir initial hexes
  Array.from(initialHexesSet).forEach((coord) => {
    const [q, r] = coord.split(",").map(Number);
    hexMap.push({
      q,
      r,
      terrain: "initial",
      isVisible: true,
      isTerraformed: false,
      isRadius: false,
      building: null,
      construction: undefined,
      previousBuilding: null,
      resources: generateRandomResources(),
    });
  });

  // Añadir border hexes
  Array.from(borderHexesSet).forEach((coord) => {
    const [q, r] = coord.split(",").map(Number);
    hexMap.push({
      q,
      r,
      terrain: "border",
      isVisible: false,
      isTerraformed: false,
      isRadius: true,
      building: null,
      construction: undefined,
      previousBuilding: null,
      resources: generateRandomResources(),
    });
  });

  return hexMap;
};

// Devuelve los vecinos de un hex axial
const getNeighbors = (q: number, r: number): { q: number; r: number }[] => [
  { q: q + 1, r: r },
  { q: q - 1, r: r },
  { q: q, r: r + 1 },
  { q: q, r: r - 1 },
  { q: q + 1, r: r - 1 },
  { q: q - 1, r: r + 1 },
];

// Devuelve una clave única por coordenadas
const hexKey = (q: number, r: number) => `${q},${r}`;

export function expandHexMapFromBuiltHexes(hexes: Hex[]): Hex[] {
  const newHexes = [...hexes];
  const hexMap = new Map<string, Hex>();
  hexes.forEach((h) => hexMap.set(hexKey(h.q, h.r), h));

  const builtHexes = hexes.filter((h) => h.building || h.construction);

  const toReveal = new Set<string>();
  const toBorder = new Set<string>();

  for (const hex of builtHexes) {
    const neighbors = getNeighbors(hex.q, hex.r);

    for (const n of neighbors) {
      const nKey = hexKey(n.q, n.r);
      toReveal.add(nKey);

      const secondRing = getNeighbors(n.q, n.r);
      for (const nn of secondRing) {
        const nnKey = hexKey(nn.q, nn.r);
        if (!toReveal.has(nnKey)) {
          toBorder.add(nnKey);
        }
      }
    }
  }

  // Crea o actualiza hexes según correspondan
  for (const key of toReveal) {
    if (hexMap.has(key)) {
      const h = hexMap.get(key)!;
      hexMap.set(key, {
        ...h,
        isVisible: true,
        isRadius: false,
        terrain: "initial",
      });
    } else {
      const [q, r] = key.split(",").map(Number);
      hexMap.set(key, {
        q,
        r,
        isVisible: true,
        isTerraformed: false,
        isRadius: false,
        terrain: "initial",
        building: null,
        construction: undefined,
        previousBuilding: null,
      });
    }
  }

  for (const key of toBorder) {
    if (toReveal.has(key)) continue;

    if (!hexMap.has(key)) {
      const [q, r] = key.split(",").map(Number);
      hexMap.set(key, {
        q,
        r,
        isVisible: false,
        isTerraformed: false,
        isRadius: true,
        terrain: "border",
        building: null,
        construction: undefined,
        previousBuilding: null,
      });
    } else {
      const h = hexMap.get(key)!;
      if (!h.isVisible) {
        hexMap.set(key, {
          ...h,
          isRadius: true,
          terrain: "border",
        });
      }
    }
  }

  return Array.from(hexMap.values());
}

export const getSideCoordinates = (q: number, r: number, side: number) => {
  const directions = [
    { q: +1, r: 0 }, // side 0 (East)
    { q: +1, r: -1 }, // side 1 (NE)
    { q: 0, r: -1 }, // side 2 (NW)
    { q: -1, r: 0 }, // side 3 (W)
    { q: -1, r: +1 }, // side 4 (SW)
    { q: 0, r: +1 }, // side 5 (SE)
  ];
  const dir = directions[side];
  return { q: q + dir.q, r: r + dir.r };
};

export const getHexCornerPoints = (cx: number, cy: number, size: number) => {
  const angle_deg = 60;
  const angle_rad = Math.PI / 180;
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = angle_deg * i - 30;
    const x = cx + size * Math.cos(angle * angle_rad);
    const y = cy + size * Math.sin(angle * angle_rad);
    corners.push({ x, y });
  }
  return corners;
};
