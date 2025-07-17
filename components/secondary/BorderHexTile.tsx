// components/BorderHexTile.tsx
import React from "react";
import { Polygon } from "react-native-svg";
import { terrainConfig } from "../../src/config/terrainConfig";

interface Props {
  points: string;
  index: number;
  onTouchStart: (event: any) => void;
  onTouchEnd: (event: any) => void;
}

export default function BorderHexTile({
  points,
  index,
  onTouchStart,
  onTouchEnd,
}: Props) {
  const config = terrainConfig["border"];
  return (
    <Polygon
      key={`border-${index}`}
      points={points}
      fill={config.fallbackColor}
      stroke="#444"
      strokeWidth="1"
      onPressIn={onTouchStart}
      onPressOut={onTouchEnd}
    />
  );
}
