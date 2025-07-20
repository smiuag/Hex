import { Dimensions } from "react-native";
import { getCurrentMapSize } from "../utils/mapUtils";

export const axialToPixel = (q: number, r: number) => {
  const MAP = getCurrentMapSize();
  const x = MAP.HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = MAP.HEX_SIZE * 1.5 * r;
  return { x, y };
};

export const getHexPoints = (x: number, y: number): string => {
  const MAP = getCurrentMapSize();
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const px = x + MAP.HEX_SIZE * Math.cos(angle);
    const py = y + MAP.HEX_SIZE * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(" ");
};

export function pixelToAxial(x: number, y: number) {
  if (isNaN(x) || isNaN(y)) return null;
  const MAP = getCurrentMapSize();

  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / MAP.HEX_SIZE;
  const r = ((2 / 3) * y) / MAP.HEX_SIZE;
  return hexRound(q, r);
}

function hexRound(q: number, r: number) {
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
