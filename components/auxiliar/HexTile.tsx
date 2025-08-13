import { useGameContextSelector } from "@/src/context/GameContext";
import { directionMap, getHexCornerPoints, getNeighbor, isSpecialHex } from "@/utils/hexUtils";
import React, { useEffect, useState } from "react";
import { Circle, G, Line, Polygon, Image as SvgImage, Text as SvgText } from "react-native-svg";
import { buildingConfig } from "../../src/config/buildingConfig";
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
  index: number;
  hexSize: number;
}

export default function HexTile({ hex, px, py, points, factor, fontSize, index, hexSize }: Props) {
  const { terrain, building, construction, groupId, isGroupLeader } = hex;
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);

  const buildingType = construction ? construction.building : building ? building.type : undefined;
  const buildingImage = buildingType ? buildingConfig[buildingType].image : undefined;
  const corners = getHexCornerPoints(px, py, hexSize);

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
  const imageHref = buildingImage || (hex.isTerraformed ? IMAGES.BLANK : IMAGES.HEX_LUNAR);
  const imageWidth = isTriangularStructure ? hexWidth * 2 : hexWidth;
  const imageHeight = isTriangularStructure ? hexHeight * 1.5 : hexHeight;

  const imageX = px - imageWidth / 2;
  const imageY = isTriangularStructure ? py - hexHeight * 0.43 : py - imageHeight / 2;

  const showSpecial = buildingType && buildingConfig[buildingType].special;

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
            const spacing = 2 * radius + 2 * factor;
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

      {!building && !construction && terrain == "WATER" && hex.isTerraformed && (
        <SvgImage
          href={IMAGES.WATER_DROP}
          x={px - 20 * factor} // Ajusta la posición según necesites
          y={py - 20 * factor}
          width={40 * factor} // Tamaño de la gota
          height={40 * factor}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {!building && !construction && terrain == "ANCIENT_ALIEN_STRUCTURES" && hex.isTerraformed && (
        <SvgImage
          href={IMAGES.ALIEN_STRUCTURE}
          x={px - 20 * factor} // Ajusta la posición según necesites
          y={py - 20 * factor}
          width={40 * factor} // Tamaño de la gota
          height={40 * factor}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Borde solo si NO es parte de grupo */}
      {!groupId && (
        <G key={`border-${index}`}>
          <Polygon points={points} fill="none" stroke="none" />

          {Array.from({ length: 6 }).map((_, i) => {
            const dir = directionMap[i];
            const neighbor = getNeighbor(hex.q, hex.r, dir);
            const neighbourHex = hexes.find((he) => he.q == neighbor.q && he.r == neighbor.r);
            const neighborExists = isSpecialHex(neighbourHex);
            const yellow = showSpecial || neighborExists;

            const p1 = corners[i];
            const p2 = corners[(i + 1) % 6];
            return (
              <Line
                key={`side-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={yellow ? "yellow" : "white"}
                strokeWidth={1}
              />
            );
          })}
        </G>
      )}
    </>
  );
}
