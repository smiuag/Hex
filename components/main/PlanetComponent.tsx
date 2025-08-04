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

import Toast from "react-native-toast-message";
import { IMAGES } from "../../src/constants/images";
import { useGameContextSelector } from "../../src/context/GameContext";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { getScaleValues } from "../../utils/configUtils";
import { axialToPixel, getHexPoints, pixelToAxial, SCREEN_DIMENSIONS } from "../../utils/hexUtils";
import BorderHexTile from "../auxiliar/HexBorder";
import HexTile from "../auxiliar/HexTile";
import ModalConstruction from "../auxiliar/ModalConstruction";
import ModalTerraform from "../auxiliar/ModalTerraform";

export default function PlanetComponent() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTerraformVisible, setModalTerraformVisible] = useState(false);
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);

  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const handleDestroyBuilding = useGameContextSelector((ctx) => ctx.handleDestroyBuilding);
  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleTerraform = useGameContextSelector((ctx) => ctx.handleTerraform);
  const handleUpdateConfig = useGameContextSelector((ctx) => ctx.handleUpdateConfig);

  console.log("Montado PlanetComponent");

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
    const axial = pixelToAxial(x - CENTER_X, y - CENTER_Y, scale.HEX_SIZE);
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

    if (hexToUse.building?.type == "ANTENNA") {
      router.replace("/(tabs)/planet/antenna");
      return;
    }

    const isEmpty = !hexToUse.building && !hexToUse.construction;
    if (!hexToUse.isTerraformed) {
      setSelectedHex(hexToUse);
      setModalTerraformVisible(true);
    } else if (isEmpty) {
      router.replace(
        `/(tabs)/planet/construction?terrain=${hexToUse.terrain}&q=${hexToUse.q}&r=${hexToUse.r}`
      );
    } else {
      setSelectedHex(hexToUse);
      setModalVisible(true);
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

  const onDestroy = (q: number, r: number) => {
    handleDestroyBuilding(q, r);
    setModalVisible(false);
  };

  const onTerraform = async () => {
    const currentHexesTerraformed = hexes.filter((hex) => hex.isTerraformed).length;
    const baseLevel = hexes.find((hex) => hex.building?.type === "BASE")?.building?.level;
    const baseUpgradeLevel = hexes.find((hex) => hex.construction?.building === "BASE")
      ?.construction?.targetLevel;
    const effectiveLevel = baseUpgradeLevel ?? baseLevel ?? 0;
    const terraformLimit = effectiveLevel * 10 + 3;
    const maxTerraformReached = currentHexesTerraformed >= terraformLimit;

    if (maxTerraformReached) {
      Toast.show({
        type: "info", // "success" | "info" | "error"
        text1: "Límite alcanzado",
        position: "top",
        visibilityTime: 2000,
      });
    } else if (selectedHex) {
      if (selectedHex.terrain == "water") {
        alert(
          "Este terreno parece distinto. Las primeras inspecciones indican de una gran cantidad de humedad en el subsuelo. ¡Quizá sea agua!"
        );
      }
      handleTerraform(selectedHex.q, selectedHex.r);
      setModalTerraformVisible(false);
    }
  };

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
                      hex={hex}
                      px={px}
                      py={py}
                      points={points}
                      factor={scale.FACTOR}
                      fontSize={scale.FONT_SIZE}
                    />
                  );
                })}

                <ModalConstruction
                  visible={modalVisible}
                  research={research}
                  onClose={() => setModalVisible(false)}
                  data={selectedHex}
                  onBuild={onBuild}
                  onCancelBuild={onCancel}
                  onDestroy={onDestroy}
                />

                <ModalTerraform
                  visible={modalTerraformVisible}
                  onClose={() => setModalTerraformVisible(false)}
                  data={selectedHex}
                  onTerraform={onTerraform}
                />
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
