import { SHIP_IMAGE_KEYS, SHIP_IMAGES, ShipImageKey } from "@/src/types/shipType";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

export default function ImagePickerGrid({
  value,
  onChange,
}: {
  value?: ShipImageKey;
  onChange: (k: ShipImageKey) => void;
}) {
  const [wrapWidth, setWrapWidth] = useState(0);
  const COLS = 5;
  const GAP = 8;
  const size = wrapWidth > 0 ? Math.floor((wrapWidth - GAP * (COLS - 1)) / COLS) : 0;

  return (
    <View style={styles.gridWrap} onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}>
      {SHIP_IMAGE_KEYS.slice(0, 10).map((key, i) => {
        const selected = value === key;
        const isLastInRow = (i + 1) % COLS === 0;
        const isFirstRow = i < COLS;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.tile,
              {
                width: size,
                height: size,
                marginRight: isLastInRow ? 0 : GAP,
                marginBottom: isFirstRow ? GAP : 0,
              },
              selected && styles.tileSelected,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            {/* El box ahora ocupa todo el tile */}
            <View style={styles.box}>
              {/* 👇 Estira la imagen para llenar el cuadrado */}
              <Image source={SHIP_IMAGES[key]} style={styles.tileImg} resizeMode="stretch" />
            </View>

            <View style={[styles.tileGlow, selected && styles.tileGlowOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrap: { flexDirection: "row", flexWrap: "wrap" },

  tile: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(10,14,30,0.55)",
    position: "relative",
  },

  tileSelected: {
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // La imagen llena todo el contenedor; el "stretch" la deforma para encajar
  tileImg: { width: "100%", height: "100%" },

  tileGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  tileGlowOn: { backgroundColor: "rgba(139, 92, 246, 0.15)" },

  // El contenedor ya no hace letterboxing: ocupa todo el tile
  box: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
});
