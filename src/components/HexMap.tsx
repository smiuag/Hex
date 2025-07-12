import React, { useEffect, useState } from "react";
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
import HexModal from '../../components/HexModal';
import mapData from "../../data/currentMap.json";
import { terrainConfig } from "../../data/terrain";
import { TerrainType } from "../../data/tipos";

const HEX_SIZE = 60;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SVG_WIDTH = SCREEN_WIDTH * 3;
const SVG_HEIGHT = SCREEN_HEIGHT * 3;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT / 2;


export default function HexMap() {
  type Hex = {
    q: number;
    r: number;
    terrain: TerrainType;
  };

  const [hexes, setHexes] = useState<Hex[]>([]);

useEffect(() => {
  const parsed = mapData.map(hex => ({
    ...hex,
    terrain: hex.terrain as TerrainType, 
  }));
  setHexes(parsed);
}, []);

const [modalVisible, setModalVisible] = useState(false);
const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  const axialToPixel = (q: number, r: number, size: number = HEX_SIZE) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 1.5 * r;
    return { x, y };
  };

  const getHexPoints = (x: number, y: number, size: number = HEX_SIZE): string => {
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
    <GestureHandlerRootView style={{ flex: 1 , backgroundColor: 'white' }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
            {hexes.map(({ q, r, terrain }, index) => {
              const config = terrainConfig[terrain];
              const { x, y } = axialToPixel(q, r);
              const px = x + CENTER_X;
              const py = y + CENTER_Y;
              const points = getHexPoints(px, py);

              return (
                <React.Fragment key={index}>
                  {config.image ? (
                    <SvgImage
                      href={config.image}
                      x={px - HEX_SIZE * Math.sqrt(3) * 1.14 / 2}
                      y={py - HEX_SIZE * 1.14}
                      width={HEX_SIZE * Math.sqrt(3) * 1.14}
                      height={HEX_SIZE * 2 * 1.14}
                      preserveAspectRatio="xMidYMid meet"
                      onPressIn={(event) => {
                        setTouchStartTime(Date.now());
                        setTouchStartPosition({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
                      }}

                      onPressOut={(event) => {
                        const time = Date.now();
                        const duration = time - (touchStartTime ?? 0);
                        const endPos = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
                        const dist = Math.sqrt(
                          Math.pow((endPos.x - (touchStartPosition?.x ?? 0)), 2) +
                          Math.pow((endPos.y - (touchStartPosition?.y ?? 0)), 2)
                        );

                        // Condición de "tap" → corto y sin movimiento
                        if (duration < 200 && dist < 10) {
                          setSelectedHex({ q, r, terrain });
                          setModalVisible(true);
                        }
                      }}
                    />
                  ) : (
                    <Polygon
                      points={points}
                      fill={config.fallbackColor}
                      stroke="#333"
                      strokeWidth="1"
                      onPressIn={(event) => {
                        setTouchStartTime(Date.now());
                        setTouchStartPosition({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
                      }}

                      onPressOut={(event) => {
                        const time = Date.now();
                        const duration = time - (touchStartTime ?? 0);
                        const endPos = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
                        const dist = Math.sqrt(
                          Math.pow((endPos.x - (touchStartPosition?.x ?? 0)), 2) +
                          Math.pow((endPos.y - (touchStartPosition?.y ?? 0)), 2)
                        );

                        // Condición de "tap" → corto y sin movimiento
                        if (duration < 200 && dist < 10) {
                          setSelectedHex({ q, r, terrain });
                          setModalVisible(true);
                        }
                      }}
                    />
                  )}

                  <SvgText
                    x={px}
                    y={py + 4}
                    fontSize="10"
                    fill="#000"
                    textAnchor="middle"
                  >
                    {config.label ?? terrain}
                  </SvgText>
                </React.Fragment>
              );
            })}
            <HexModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                data={selectedHex}
              />
          </Svg>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>

  );
}
