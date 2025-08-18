import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function StatRow({
  title,
  value,
  max,
  onChange,
  step = 1,
  stepDown,
  longPressPlusToMax = false,
}: {
  title: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  step?: number;
  stepDown?: number;
  longPressPlusToMax?: boolean;
}) {
  const decStep = stepDown ?? step;
  const dec = () => onChange(Math.max(0, value - decStep));
  const inc = () => onChange(Math.min(max, value + step));
  const ratio = max <= 0 ? 0 : value / max;

  return (
    <View style={styles.statRow}>
      <Pressable onPress={dec} style={[styles.stepBtn, styles.stepBtnLeft]}>
        <Text style={styles.stepText}>–</Text>
      </Pressable>

      <View style={styles.inlineBar}>
        <View style={[styles.inlineFill, { width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
        <Text style={styles.inlineText} numberOfLines={1}>
          {title.toUpperCase()} {value}/{max}
        </Text>
      </View>

      <Pressable
        onPress={inc}
        onLongPress={() => longPressPlusToMax && onChange(max)}
        delayLongPress={250}
        style={[styles.stepBtn, styles.stepBtnRight]}
      >
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  inlineBar: {
    flex: 1,
    height: 32,
    backgroundColor: "rgba(10,14,30,0.55)",
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  inlineFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#8b5cf6",
  },
  inlineText: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  stepBtn: {
    width: 36,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,14,30,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  stepBtnLeft: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  stepBtnRight: { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  stepText: { color: "#ffffff", fontSize: 18, fontWeight: "900", marginTop: -1 },
});
