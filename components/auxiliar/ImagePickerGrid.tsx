import { SHIP_IMAGE_KEYS, SHIP_IMAGES, ShipImageKey } from "@/src/types/shipType";
import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

type Props = {
  value?: ShipImageKey;
  onChange?: (k: ShipImageKey) => void;
  disabled?: boolean; // opcional
  max?: number; // opcional (por defecto 10)
};

export default function ImagePickerGrid({ value, onChange, disabled = false, max = 10 }: Props) {
  const [wrapWidth, setWrapWidth] = useState(0);
  const COLS = 5;
  const GAP = 8;

  const items = useMemo(() => SHIP_IMAGE_KEYS.slice(0, max), [max]);
  const size = wrapWidth > 0 ? Math.floor((wrapWidth - GAP * (COLS - 1)) / COLS) : 0;
  const rows = Math.ceil(items.length / COLS);

  return (
    <View style={styles.gridWrap} onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}>
      {items.map((key, i) => {
        const selected = value === key;
        const isLastInRow = (i + 1) % COLS === 0;
        const rowIndex = Math.floor(i / COLS);
        const isLastRow = rowIndex === rows - 1;

        const isDisabled = disabled || !onChange;

        return (
          <Pressable
            key={key}
            onPress={() => onChange?.(key)}
            disabled={isDisabled}
            style={[
              styles.tile,
              {
                width: size,
                height: size,
                marginRight: isLastInRow ? 0 : GAP,
                marginBottom: isLastRow ? 0 : GAP,
              },
              selected && styles.tileSelected,
              isDisabled && styles.tileDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: isDisabled }}
          >
            <View style={styles.box}>
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
    borderColor: "#5c9cf6ff",
    shadowColor: "#5c69f6ff",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  tileDisabled: {
    opacity: 0.55,
  },

  tileImg: { width: "100%", height: "100%" },

  tileGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  tileGlowOn: { backgroundColor: "rgba(139, 92, 246, 0.15)" },

  box: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
});
