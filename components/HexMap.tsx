import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Polygon,
  Svg,
  Image as SvgImage,
  Text as SvgText,
} from "react-native-svg";
import { buildingConfig } from "../data/buildings";
import { terrainConfig } from "../data/terrain";
import { BuildingType, Hex } from "../data/tipos";
import { loadMap, saveMap } from "../src/services/storage";
import { getBuildTime } from "../utils/helpers";
import { normalizeHexMap } from "../utils/mapNormalizer";
import HexModal from "./HexModal";

const HEX_SIZE = 60;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SVG_WIDTH = SCREEN_WIDTH * 3;
const SVG_HEIGHT = SCREEN_HEIGHT * 3;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT / 2;

export default function HexMap() {
  const [hexes, setHexes] = useState<Hex[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [touchStartPosition, setTouchStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [tick, setTick] = useState(0);
  const hexesRef = useRef<Hex[]>([]);

  const handleBuild = (type: BuildingType) => {
    if (!selectedHex) return;

    const updated = hexes.map((hex) => {
      if (hex.q === selectedHex.q && hex.r === selectedHex.r) {
        const currentLevel =
          hex.building?.type === type ? hex.building.level : 0;
        return {
          ...hex,
          previousBuilding: hex.building ?? null,
          construction: {
            building: type,
            startedAt: Date.now(),
            targetLevel: currentLevel + 1,
          },
          building: null,
        };
      }
      return hex;
    });

    setHexes(updated);
    hexesRef.current = updated;
    saveMap(updated);
    setModalVisible(false);
  };

  const handleCancelBuild = async () => {
    if (!selectedHex) return;

    const updated = hexes.map((hex) => {
      if (hex.q === selectedHex.q && hex.r === selectedHex.r) {
        const { construction, previousBuilding, ...rest } = hex;
        return {
          ...rest,
          construction: undefined,
          building: previousBuilding ?? null,
          previousBuilding: undefined,
        };
      }
      return hex;
    });

    setHexes(updated);
    hexesRef.current = updated;
    await saveMap(updated);
    setModalVisible(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      const updated = hexesRef.current.map((hex) => {
        if (hex.construction) {
          const { building, startedAt, targetLevel } = hex.construction;
          const buildTime = getBuildTime(building, targetLevel);
          const timePassed = now - startedAt;

          if (timePassed >= buildTime) {
            changed = true;
            return {
              ...hex,
              construction: undefined,
              building: {
                type: building,
                level: targetLevel,
              },
            };
          }
        }
        return { ...hex };
      });

      if (changed) {
        hexesRef.current = updated;
        setHexes([...updated]);
        setTick((prev) => prev + 1);
        saveMap(updated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        const savedMap = await loadMap();
        if (savedMap) {
          let normalized = normalizeHexMap(savedMap);
          const now = Date.now();
          let changed = false;

          normalized = normalized.map((hex) => {
            if (hex.construction) {
              const { building, startedAt, targetLevel } = hex.construction;
              const buildTime = getBuildTime(building, targetLevel);

              if (now - startedAt >= buildTime) {
                changed = true;
                return {
                  ...hex,
                  building: {
                    type: building,
                    level: targetLevel,
                  },
                  construction: undefined,
                };
              }
            }
            return hex;
          });

          setHexes(normalized);
          hexesRef.current = normalized;

          if (changed) {
            await saveMap(normalized);
          }
        } else {
          setHexes([]);
          hexesRef.current = [];
        }
      };
      fetch();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const offsetX = useSharedValue(SCREEN_WIDTH / 2 - CENTER_X);
  const offsetY = useSharedValue(SCREEN_HEIGHT / 2 - CENTER_Y);
  const lastOffsetX = useSharedValue(offsetX.value);
  const lastOffsetY = useSharedValue(offsetY.value);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      lastOffsetX.value = offsetX.value;
      lastOffsetY.value = offsetY.value;
    })
    .onUpdate((event) => {
      offsetX.value = lastOffsetX.value + event.translationX;
      offsetY.value = lastOffsetY.value + event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    };
  });

  const axialToPixel = (q: number, r: number, size: number = HEX_SIZE) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 1.5 * r;
    return { x, y };
  };

  const getHexPoints = (
    x: number,
    y: number,
    size: number = HEX_SIZE
  ): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return points.join(" ");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
            {hexes.map((hex, index) => {
              const { q, r, terrain, building, construction } = hex;
              const config = terrainConfig[terrain];
              const { x, y } = axialToPixel(q, r);
              const px = x + CENTER_X;
              const py = y + CENTER_Y;
              const points = getHexPoints(px, py);
              const buildingImage = construction
                ? buildingConfig[construction.building].underConstructionImage
                : building
                ? buildingConfig[building.type].image
                : undefined;

              const onTouchStart = (event: any) => {
                setTouchStartTime(Date.now());
                setTouchStartPosition({
                  x: event.nativeEvent.locationX,
                  y: event.nativeEvent.locationY,
                });
              };

              const onTouchEnd = (event: any) => {
                const time = Date.now();
                const duration = time - (touchStartTime ?? 0);
                const endPos = {
                  x: event.nativeEvent.locationX,
                  y: event.nativeEvent.locationY,
                };
                const dist = Math.sqrt(
                  Math.pow(endPos.x - (touchStartPosition?.x ?? 0), 2) +
                    Math.pow(endPos.y - (touchStartPosition?.y ?? 0), 2)
                );
                if (duration < 200 && dist < 10) {
                  setSelectedHex(hex);
                  setModalVisible(true);
                }
              };

              return (
                <React.Fragment key={index}>
                  {buildingImage ? (
                    <SvgImage
                      href={buildingImage}
                      x={px - (HEX_SIZE * Math.sqrt(3) * 1.14) / 2}
                      y={py - HEX_SIZE * 1.14}
                      width={HEX_SIZE * Math.sqrt(3) * 1.14}
                      height={HEX_SIZE * 2 * 1.14}
                      preserveAspectRatio="xMidYMid meet"
                      onPressIn={onTouchStart}
                      onPressOut={onTouchEnd}
                    />
                  ) : (
                    <Polygon
                      points={points}
                      fill={config.fallbackColor}
                      stroke="#333"
                      strokeWidth="1"
                      onPressIn={onTouchStart}
                      onPressOut={onTouchEnd}
                    />
                  )}
                  {construction && (
                    <SvgText
                      x={px}
                      y={py + HEX_SIZE * 0.2}
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
                          (getBuildTime(
                            construction.building,
                            construction.targetLevel
                          ) -
                            (Date.now() - construction.startedAt)) /
                            1000
                        )
                      )}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
            <HexModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              data={selectedHex}
              onBuild={handleBuild}
              onCancelBuild={handleCancelBuild}
            />
          </Svg>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
