import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, ImageBackground } from "react-native";
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
import { terrainConfig } from "../data/terrain";
import { BuildingType, Hex, buildingConfig } from "../data/tipos";
import { useGameContext } from "../src/context/GameContext";
import { getBuildTime } from "../utils/buildingUtils";
import HexModal from "./HexModal";

const HEX_SIZE = 60;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SVG_WIDTH = SCREEN_WIDTH * 3;
const SVG_HEIGHT = SCREEN_HEIGHT * 3;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT / 2;

export default function HexMap() {
  const {
    hexes,
    reloadMap,
    processConstructionTick,
    handleBuild,
    handleCancelBuild,
  } = useGameContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [touchStartPosition, setTouchStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      processConstructionTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [processConstructionTick]);

  useFocusEffect(
    useCallback(() => {
      reloadMap();
    }, [reloadMap])
  );

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

  const onBuild = (type: BuildingType) => {
    if (!selectedHex) return;
    handleBuild(selectedHex.q, selectedHex.r, type);
    setModalVisible(false);
  };

  const onCancel = () => {
    if (selectedHex) {
      handleCancelBuild(selectedHex.q, selectedHex.r);
      setModalVisible(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
              {hexes.map((hex, index) => {
                if (hex.isRadius) {
                  const { q, r } = hex;
                  const { x, y } = axialToPixel(q, r);
                  const px = x + CENTER_X;
                  const py = y + CENTER_Y;
                  const points = getHexPoints(px, py);
                  const config = terrainConfig["border"];

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
                      // Puedes mostrar otro modal aquí si lo deseas
                      alert(
                        "Necesitas subir de nivel tu base para explorar esta zona."
                      );
                    }
                  };

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

                if (!hex.isVisible) return null;

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
                onBuild={onBuild}
                onCancelBuild={onCancel}
              />
            </Svg>
          </Animated.View>
        </GestureDetector>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}
