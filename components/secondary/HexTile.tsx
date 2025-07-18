// components/HexTile.tsx
import React from "react";
import { Polygon, Image as SvgImage, Text as SvgText } from "react-native-svg";
import { buildingConfig } from "../../src/config/buildingConfig";
import { terrainConfig } from "../../src/config/terrainConfig";
import { Hex } from "../../src/types/hexTypes";
import { getBuildTime } from "../../utils/buildingUtils";

interface Props {
  hex: Hex;
  px: number;
  py: number;
  points: string;
  onTouchStart: (event: any) => void;
  onTouchEnd: (event: any) => void;
}

export default function HexTile({
  hex,
  px,
  py,
  points,
  onTouchStart,
  onTouchEnd,
}: Props) {
  const { terrain, building, construction } = hex;
  const config = terrainConfig[terrain];

  const buildingImage = construction
    ? buildingConfig[construction.building].underConstructionImage
    : building
    ? buildingConfig[building.type].images.find(
        (img) => img.level === building.level
      )?.image
    : undefined;

  return (
    <>
      {buildingImage ? (
        <SvgImage
          href={buildingImage}
          x={px - (60 * Math.sqrt(3) * 1.25) / 2}
          y={py - 60 * 1.25}
          width={60 * Math.sqrt(3) * 1.25}
          height={60 * 2 * 1.25}
          preserveAspectRatio="xMidYMid meet"
          onPressIn={onTouchStart}
          onPressOut={onTouchEnd}
        />
      ) : (
        <Polygon
          points={points}
          fill={config.fallbackColor}
          stroke="#333"
          strokeWidth="3"
          onPressIn={onTouchStart}
          onPressOut={onTouchEnd}
        />
      )}

      {construction && (
        <SvgText
          x={px}
          y={py + 60 * 0.2}
          textAnchor="middle"
          fontSize="36"
          fill="white"
          fontWeight="bold"
          stroke="black"
          strokeWidth={0.5}
        >
          {Math.max(
            0,
            Math.ceil(
              (getBuildTime(construction.building, construction.targetLevel) -
                (Date.now() - construction.startedAt)) /
                1000
            )
          )}
        </SvgText>
      )}
    </>
  );
}
