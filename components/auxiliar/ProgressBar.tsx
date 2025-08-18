import React from "react";
import { StyleSheet, View } from "react-native";

export default function ProgressBar({ ratio }: { ratio: number }) {
  const w = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${w}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(24, 56, 32, 0.55)",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#22c55e" },
});
