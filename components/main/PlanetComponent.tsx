// components/HexMap.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
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
  pixelToAxial,
  SCREEN_DIMENSIONS,
} from "../../utils/hexUtils";

import BorderHexTile from "../secondary/BorderHexTile";
import HexModal from "../secondary/HexModal";
import HexTile from "../secondary/HexTile";

export default function PlanetComponent() {
  console.log("Planet");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    });

  const router = useRouter();
  const {
    hexes,
    research,
    resources,
    reloadMap,
    handleBuild,
    handleCancelBuild,
  } = useGameContext();

  const {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SVG_WIDTH,
    SVG_HEIGHT,
    CENTER_X,
    CENTER_Y,
  } = SCREEN_DIMENSIONS;

  // Cámara
  const offsetX = useSharedValue(SCREEN_WIDTH / 2 - CENTER_X);
  const offsetY = useSharedValue(SCREEN_HEIGHT / 2 - CENTER_Y);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return { x: offsetX.value, y: offsetY.value };
    },
    (result) => {
      runOnJS(setCameraOffset)(result);
    },
    []
  );

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
      { scale: scale.value },
    ],
  }));

  const handleTap = (x: number, y: number) => {
    const axial = pixelToAxial(x - CENTER_X, y - CENTER_Y);

    const tappedHex = hexes.find((h) => h.q === axial!.q && h.r === axial!.r);

    if (!tappedHex) {
      return;
    }

    if (tappedHex.isRadius) {
      alert("Mejora la base para acceder a las zonas más alejadas.");
      return;
    }

    if (!tappedHex.isVisible) return;

    const isEmpty = !tappedHex.building && !tappedHex.construction;
    if (isEmpty) {
      router.replace(
        `/(tabs)/planet/construction?q=${tappedHex.q}&r=${tappedHex.r}`
      );
    } else {
      setSelectedHex(tappedHex);
      setModalVisible(true);
    }
  };

  const tapGesture = Gesture.Tap()
    .maxDuration(300)
    .maxDistance(20)
    .onEnd((event) => {
      const x = event.absoluteX - cameraOffset.x;
      const y = event.absoluteY - cameraOffset.y;
      runOnJS(handleTap)(x, y);
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Exclusive(tapGesture, panGesture),
    pinchGesture
  );

  const onBuild = async (type: BuildingType) => {
    if (selectedHex) {
      await handleBuild(selectedHex.q, selectedHex.r, type);
      setModalVisible(false);
    }
  };

  const onCancel = () => {
    if (selectedHex) {
      handleCancelBuild(selectedHex.q, selectedHex.r);
      setModalVisible(false);
    }
  };

  useEffect(() => {
    reloadMap();
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadMap();
    }, [reloadMap])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      <ImageBackground
        source={IMAGES.BACKGROUND_IMAGE}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <GestureDetector gesture={composedGesture}>
          <View style={{ flex: 1 }} pointerEvents="box-only">
            <Animated.View
              style={[
                {
                  width: SVG_WIDTH,
                  height: SVG_HEIGHT,
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                animatedStyle,
              ]}
            >
              <Svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                pointerEvents="none"
                style={{ top: 0, left: 0 }}
              >
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
                    />
                  );
                })}

                <HexModal
                  visible={modalVisible}
                  research={research}
                  resources={resources}
                  onClose={() => setModalVisible(false)}
                  data={selectedHex}
                  onBuild={onBuild}
                  onCancelBuild={onCancel}
                />
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}
