import React, { useEffect, useState } from "react";
import { Polygon, Image as SvgImage, Text as SvgText } from "react-native-svg";
import { buildingConfig } from "../../src/config/buildingConfig";
import { terrainConfig } from "../../src/config/terrainConfig";
import { Hex } from "../../src/types/hexTypes";
import { getBuildTime } from "../../utils/buildingUtils";
import { formatDuration } from "../../utils/generalUtils";

interface Props {
  hex: Hex;
  px: number;
  py: number;
  points: string;
  factor: number;
  fontSize: number;
}

export default function HexTile({ hex, px, py, points, factor, fontSize }: Props) {
  const { terrain, building, construction } = hex;
  const config = terrainConfig[terrain];

  const buildingImage = construction
    ? buildingConfig[construction.building].underConstructionImage
    : building
    ? buildingConfig[building.type].images.find((img) => img.level === building.level)?.image
    : undefined;

  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!construction) return;

    const initialTime = Math.max(
      0,
      Math.ceil(
        getBuildTime(construction.building, construction.targetLevel) -
          (Date.now() - construction.startedAt)
      )
    );

    setRemainingTime(initialTime);

    const interval = setInterval(() => {
      setRemainingTime((prevTime) => Math.max(0, prevTime - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [construction]);

  return (
    <>
      {buildingImage ? (
        <SvgImage
          href={buildingImage}
          x={px - (60 * Math.sqrt(3) * factor) / 2}
          y={py - 60 * factor}
          width={60 * Math.sqrt(3) * factor}
          height={60 * 2 * factor}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <Polygon points={points} fill={config.fallbackColor} stroke="#333" strokeWidth="3" />
      )}

      {construction && remainingTime > 0 && (
        <SvgText
          x={px}
          y={py + 60 * 0.2}
          textAnchor="middle"
          fontSize={fontSize}
          fill="white"
          fontWeight="bold"
          stroke="black"
          strokeWidth={0.5}
        >
          {formatDuration(remainingTime, true)}
        </SvgText>
      )}
    </>
  );
}
