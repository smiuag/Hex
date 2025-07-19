// components/HexMap.tsx
import { useFocusEffect } from "@react-navigation/native";

import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ImageBackground } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg from "react-native-svg";

import { IMAGES } from "../../src/constants/images";
import { useGameContext } from "../../src/context/GameContext";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import {
  axialToPixel,
  getHexPoints,
  SCREEN_DIMENSIONS,
} from "../../utils/hexUtils";

import BorderHexTile from "../secondary/BorderHexTile";
import HexModal from "../secondary/HexModal";
import HexTile from "../secondary/HexTile";

export default function PlanetComponent() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  const router = useRouter();
  const { hexes, research, reloadMap, handleBuild, handleCancelBuild } =
    useGameContext();
  const {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SVG_WIDTH,
    SVG_HEIGHT,
    CENTER_X,
    CENTER_Y,
  } = SCREEN_DIMENSIONS;

  // ✅ Setup inicial
  useFocusEffect(
    useCallback(() => {
      reloadMap();
    }, [reloadMap])
  );

  // ✅ Cámara / desplazamiento
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
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  // ✅ Eventos
  const handlePressIn = (event: any) => {
    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
  };

  const handlePressOut =
    (hex: Hex | null, fallbackAction?: () => void) => (event: any) => {
      const time = Date.now();
      const duration = time - (touchStartTime.current ?? 0);
      const endPos = {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
      const dist = Math.sqrt(
        Math.pow(endPos.x - (touchStartPosition.current?.x ?? 0), 2) +
          Math.pow(endPos.y - (touchStartPosition.current?.y ?? 0), 2)
      );

      if (duration < 200 && dist < 10) {
        if (hex) {
          const isEmpty = !hex.building && !hex.construction;
          if (isEmpty) {
            router.replace(`/(tabs)/planet/construction?q=${hex.q}&r=${hex.r}`);
          } else {
            setSelectedHex(hex);
            setModalVisible(true);
          }
        } else {
          fallbackAction?.();
        }
      }
    };

  const onBuild = (type: BuildingType) => {
    if (selectedHex) {
      handleBuild(selectedHex.q, selectedHex.r, type);
      setModalVisible(false);
    }
  };

  const onCancel = () => {
    if (selectedHex) {
      handleCancelBuild(selectedHex.q, selectedHex.r);
      setModalVisible(false);
    }
  };

  // ✅ Render
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      <ImageBackground
        source={IMAGES.BACKGROUND_IMAGE}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
              {hexes.map((hex, index) => {
                const { q, r } = hex;
                const { x, y } = axialToPixel(q, r);
                const px = x + CENTER_X;
                const py = y + CENTER_Y;
                const points = getHexPoints(px, py);

                if (hex.isRadius) {
                  return (
                    <BorderHexTile
                      key={`border-${index}`}
                      points={points}
                      index={index}
                      onTouchStart={handlePressIn}
                      onTouchEnd={handlePressOut(null, () =>
                        alert(
                          "Necesitas subir de nivel tu base para explorar esta zona."
                        )
                      )}
                    />
                  );
                }

                if (!hex.isVisible) return null;

                return (
                  <HexTile
                    key={index}
                    hex={hex}
                    px={px}
                    py={py}
                    points={points}
                    onTouchStart={handlePressIn}
                    onTouchEnd={handlePressOut(hex)}
                  />
                );
              })}

              <HexModal
                visible={modalVisible}
                research={research}
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
