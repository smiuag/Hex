import React from "react";
import { G, Line, Polygon } from "react-native-svg";
import { terrainConfig } from "../../src/config/terrainConfig";
import { Hex } from "../../src/types/hexTypes";
import { directionMap, getHexCornerPoints, getNeighbor, isOccupied } from "../../utils/hexUtils";

interface Props {
  hex: Hex;
  hexes: Hex[];
  points: string;
  px: number;
  py: number;
  index: number;
  hexSize: number;
}

export default function BorderHexTile({ hex, hexes, points, px, py, index, hexSize }: Props) {
  const config = terrainConfig["BORDER"];
  const corners = getHexCornerPoints(px, py, hexSize);

  return (
    <G key={`border-${index}`}>
      <Polygon points={points} fill={config.fallbackColor} stroke="none" />

      {Array.from({ length: 6 }).map((_, i) => {
        const dir = directionMap[i];
        const neighbor = getNeighbor(hex.q, hex.r, dir);
        const neighborExists = isOccupied(neighbor.q, neighbor.r, hexes);

        if (!neighborExists) {
          const p1 = corners[i];
          const p2 = corners[(i + 1) % 6];
          return (
            <Line
              key={`side-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#444"
              strokeWidth="1"
            />
          );
        }
        return null;
      })}
    </G>
  );
}
