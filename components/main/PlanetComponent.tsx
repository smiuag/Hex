import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg from "react-native-svg";
import { scaleKeys, ScaleSize } from "../../src/types/configTypes";

import { useConstructionModalStore } from "@/src/store/modalStore";
import { useTerraformModalStore } from "@/src/store/terraformModalStore";
import { IMAGES } from "../../src/constants/images";
import { useGameContextSelector } from "../../src/context/GameContext";
import { getScaleValues } from "../../utils/configUtils";
import { axialToPixel, getHexPoints, pixelToAxial, SCREEN_DIMENSIONS } from "../../utils/hexUtils";
import BorderHexTile from "../auxiliar/HexBorder";
import HexTile from "../auxiliar/HexTile";

export default function PlanetComponent() {
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const handleUpdateConfig = useGameContextSelector((ctx) => ctx.handleUpdateConfig);

  const scale = getScaleValues(playerConfig);
  const { SCREEN_WIDTH, SCREEN_HEIGHT, SVG_WIDTH, SVG_HEIGHT, CENTER_X, CENTER_Y } =
    SCREEN_DIMENSIONS;

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

  const showConstruction = useConstructionModalStore.getState().showConstruction;
  const showTerraform = useTerraformModalStore.getState().showTerraform;

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

  const handleTap = (x: number, y: number) => {
    const axial = pixelToAxial(x - CENTER_X, y - CENTER_Y - scale.Y_ADJUST, scale.HEX_SIZE); //scale.HEX_SIZE en Y para compensar elas barras que salen abajo y no tiene en cuenta
    const tappedHex = hexes.find((h) => h.q === axial!.q && h.r === axial!.r);

    if (!tappedHex) return;

    const hexToUse =
      tappedHex.groupId && !tappedHex.isGroupLeader
        ? hexes.find((h) => h.groupId === tappedHex.groupId && h.isGroupLeader)
        : tappedHex;

    if (!hexToUse) return;

    if (hexToUse.isRadius) {
      alert("Mejora la base para acceder a las zonas más alejadas.");
      return;
    }

    if (
      hexToUse.building?.type == "ANTENNA" ||
      (hexToUse.construction?.building == "ANTENNA" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace(`/(tabs)/planet/antenna?q=${tappedHex.q}&r=${tappedHex.r}`);
      return;
    }

    if (
      hexToUse.building?.type == "HANGAR" ||
      (hexToUse.construction?.building == "HANGAR" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace(`/(tabs)/planet/hangar?q=${tappedHex.q}&r=${tappedHex.r}`);
      return;
    }

    if (
      hexToUse.building?.type == "ROCKET" ||
      (hexToUse.construction?.building == "ROCKET" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace(`/(tabs)/planet/rocket?q=${tappedHex.q}&r=${tappedHex.r}`);
      return;
    }

    if (
      hexToUse.building?.type == "LAB" ||
      (hexToUse.construction?.building == "LAB" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace(`/(tabs)/planet/lab?q=${tappedHex.q}&r=${tappedHex.r}`);
      return;
    }

    if (
      hexToUse.building?.type == "ALIEN_LAB" ||
      (hexToUse.construction?.building == "ALIEN_LAB" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace(`/(tabs)/planet/lab?q=${tappedHex.q}&r=${tappedHex.r}`);
      return;
    }

    if (
      hexToUse.building?.type == "EMBASSY" ||
      (hexToUse.construction?.building == "EMBASSY" && hexToUse.construction.targetLevel > 1)
    ) {
      router.replace("/(tabs)/planet/embassy");
      return;
    }

    const isEmpty = !hexToUse.building && !hexToUse.construction;
    if (!hexToUse.isTerraformed) {
      showTerraform(hexToUse);
    } else if (isEmpty) {
      router.replace(
        `/(tabs)/planet/construction?terrain=${hexToUse.terrain}&q=${hexToUse.q}&r=${hexToUse.r}`
      );
    } else {
      if (hexToUse) showConstruction(hexToUse);
    }
  };

  const increaseScale = () => {
    const currentMapSize =
      (playerConfig.find((c) => c.key === "MAP_SIZE")?.value as ScaleSize) || "MEDIUM";
    const currentIndex = scaleKeys.indexOf(currentMapSize);
    const nextIndex = Math.min(currentIndex + 1, scaleKeys.length - 1);

    if (nextIndex !== currentIndex) {
      const newScaleKey = scaleKeys[nextIndex];
      handleUpdateConfig({ key: "MAP_SIZE", value: newScaleKey });
    }
  };

  const decreaseScale = () => {
    const currentMapSize =
      (playerConfig.find((c) => c.key === "MAP_SIZE")?.value as ScaleSize) || "MEDIUM";
    const currentIndex = scaleKeys.indexOf(currentMapSize);
    const nextIndex = Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      const newScaleKey = scaleKeys[nextIndex];
      handleUpdateConfig({ key: "MAP_SIZE", value: newScaleKey });
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

  const composedGesture = Gesture.Simultaneous(Gesture.Exclusive(tapGesture, panGesture));

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      <ImageBackground source={IMAGES.BACKGROUND_IMAGE} style={{ flex: 1 }} resizeMode="cover">
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
                  const { x, y } = axialToPixel(q, r, scale.HEX_SIZE);
                  const px = x + CENTER_X;
                  const py = y + CENTER_Y;
                  const points = getHexPoints(px, py, scale.HEX_SIZE);

                  if (hex.isRadius) {
                    return (
                      <BorderHexTile
                        key={index}
                        hex={hex}
                        hexes={hexes}
                        points={points}
                        px={px}
                        py={py}
                        hexSize={scale.HEX_SIZE}
                        index={index}
                      />
                    );
                  }

                  if (!hex.isVisible) return null;

                  return (
                    <HexTile
                      key={index}
                      index={index}
                      hex={hex}
                      px={px}
                      py={py}
                      points={points}
                      factor={scale.FACTOR}
                      fontSize={scale.FONT_SIZE}
                      hexSize={scale.HEX_SIZE}
                    />
                  );
                })}
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      </ImageBackground>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={decreaseScale}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={increaseScale}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  buttonsContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
