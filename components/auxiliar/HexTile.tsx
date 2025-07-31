import React, { useEffect, useState } from "react";
import { Circle, Polygon, Image as SvgImage, Text as SvgText } from "react-native-svg";
import { buildingConfig } from "../../src/config/buildingConfig";
import { terrainConfig } from "../../src/config/terrainConfig";
import { IMAGES } from "../../src/constants/images";
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
  const { terrain, building, construction, groupId, isGroupLeader } = hex;
  const config = terrainConfig[terrain];

  const buildingImage = construction
    ? buildingConfig[construction.building].underConstructionImage
    : building
    ? buildingConfig[building.type].image
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

  // Si el hex pertenece a un grupo pero no es el líder, no dibuja nada
  if (groupId && !isGroupLeader) return null;

  // Tamaños base
  const hexWidth = 60 * Math.sqrt(3) * factor;
  const hexHeight = 60 * 2 * factor;

  // Si es el líder de un grupo triangular
  const isTriangularStructure = groupId === "triangleStructure" && isGroupLeader;

  // Imagen y su posicionamiento
  const imageHref = buildingImage || IMAGES.BLANK;
  const imageWidth = isTriangularStructure ? hexWidth * 2 : hexWidth;
  const imageHeight = isTriangularStructure ? hexHeight * 1.5 : hexHeight;

  const imageX = px - imageWidth / 2;
  const imageY = isTriangularStructure ? py - hexHeight * 0.43 : py - imageHeight / 2;

  return (
    <>
      <SvgImage
        href={imageHref}
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={imageHeight}
        preserveAspectRatio="xMidYMid meet"
      />

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

      {building && building.level > 0 && (
        <>
          {Array.from({ length: building.level }, (_, i) => {
            const total = building.level;
            const radius = 2.5 * factor;
            const spacing = 1.5 * radius + 2 * factor;
            const startX = px - ((total - 1) * spacing) / 2;
            const y = py - 60 * factor + 0.2 * 2 * 60 * factor;

            return (
              <Circle
                key={i}
                cx={startX + i * spacing}
                cy={y}
                r={radius}
                fill="limegreen"
                stroke="white"
                strokeWidth={1}
              />
            );
          })}
        </>
      )}

      {/* Borde solo si NO es parte de grupo */}
      {!groupId && <Polygon points={points} fill="none" stroke="white" strokeWidth={3 * factor} />}
    </>
  );
}
