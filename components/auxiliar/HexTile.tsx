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

      {building &&
        building.level > 0 &&
        (() => {
          // 4 puntos por arista (incluyendo extremos) => 6*4 - 6 = 18 únicos
          const pointsPerEdge = 4;
          const maxDots = 18;
          const dotCount = Math.min(building.level, maxDots);

          const radius = 2.5 * factor;
          const pad = 2 * factor; // margen respecto al borde interior

          type Pt = { x: number; y: number };

          // Centro geométrico del hex
          const center = {
            x: corners.reduce((s, p) => s + p.x, 0) / 6,
            y: corners.reduce((s, p) => s + p.y, 0) / 6,
          };

          // Línea ax + by = c
          const lineFromPoints = (p: Pt, q: Pt) => {
            const a = q.y - p.y;
            const b = p.x - q.x;
            const c = a * p.x + b * p.y;
            const norm = Math.hypot(a, b) || 1;
            return { a, b, c, norm };
          };

          // Intersección de dos líneas ax + by = c
          const intersect = (
            L1: { a: number; b: number; c: number },
            L2: { a: number; b: number; c: number }
          ): Pt => {
            const det = L1.a * L2.b - L2.a * L1.b || 1e-9;
            return {
              x: (L2.b * L1.c - L1.b * L2.c) / det,
              y: (L1.a * L2.c - L2.a * L1.c) / det,
            };
          };

          // 0) Líneas originales y distancia del centro a cada una
          const baseLines = Array.from({ length: 6 }, (_, e) => {
            const A = corners[e];
            const B = corners[(e + 1) % 6];
            return lineFromPoints(A, B);
          });

          const distToCenter = baseLines.map((L) => {
            const signed = (L.a * center.x + L.b * center.y - L.c) / L.norm;
            return Math.abs(signed);
          });

          // 1) Distancia hacia dentro segura y común
          const desiredInward = 8 * factor + radius;
          const maxInwardGlobal =
            Math.max(0, Math.min(...distToCenter.map((d) => d - (radius + pad))) - 1e-3) || 0;
          const inward = Math.min(desiredInward, maxInwardGlobal);

          // 2) Desplaza cada línea hacia el centro (signo correcto)
          const offsetLines = baseLines.map((L) => {
            const sideCenter = (L.a * center.x + L.b * center.y - L.c) / L.norm;
            const c2 = L.c + Math.sign(sideCenter) * inward * L.norm;
            return { a: L.a, b: L.b, c: c2 };
          });

          // 3) Vértices del hexágono interior
          const insetCorners: Pt[] = [];
          for (let e = 0; e < 6; e++) {
            const Lprev = offsetLines[(e + 5) % 6];
            const Lcurr = offsetLines[e];
            insetCorners.push(intersect(Lprev, Lcurr));
          }

          // 4) Genera 18 puntos: 4 por arista, sin duplicar vértices
          const edgeDots: Pt[] = [];
          for (let e = 0; e < 6; e++) {
            const A = insetCorners[e];
            const B = insetCorners[(e + 1) % 6];
            const vx = B.x - A.x;
            const vy = B.y - A.y;

            for (let j = 0; j < pointsPerEdge; j++) {
              // Evitar duplicados en vértices
              if (e > 0 && j === 0) continue;
              if (e === 5 && j === pointsPerEdge - 1) continue;

              const t = j / (pointsPerEdge - 1); // 0..1
              edgeDots.push({ x: A.x + vx * t, y: A.y + vy * t });
            }
          }

          return (
            <>
              {edgeDots.slice(0, dotCount).map((p, i) => (
                <Circle
                  key={`lvl-dot-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  fill="limegreen"
                  stroke="white"
                  strokeWidth={1}
                />
              ))}
            </>
          );
        })()}

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
