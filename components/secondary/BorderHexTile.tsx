// components/BorderHexTile.tsx
import React from "react";
import { Polygon } from "react-native-svg";
import { terrainConfig } from "../../src/config/terrainConfig";

interface Props {
  points: string;
  index: number;
}

export default function BorderHexTile({ points, index }: Props) {
  const config = terrainConfig["border"];
  return (
    <Polygon
      key={`border-${index}`}
      points={points}
      fill={config.fallbackColor}
      stroke="#444"
      strokeWidth="1"
    />
  );
}
