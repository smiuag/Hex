import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
  emoji?: string;
};

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  compact = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly SegmentedOption<T>[];
  compact?: boolean;
}) {
  return (
    <View style={[styles.segment, compact && styles.segmentCompact]}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segmentBtn,
              compact && styles.segmentBtnCompact,
              active && styles.segmentBtnActive,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.segmentText,
                compact && styles.segmentTextCompact,
                active && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              {opt.emoji ? `${opt.emoji} ` : ""}
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(10,14,30,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
  },
  segmentCompact: { paddingVertical: 2 },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentBtnCompact: { paddingVertical: 6 },
  segmentBtnActive: {
    backgroundColor: "rgba(70,46,120,0.55)",
    borderWidth: 1,
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  segmentText: { color: "#cfd6ff", fontWeight: "600" },
  segmentTextCompact: { fontSize: 12 },
  segmentTextActive: { color: "#ffffff", fontWeight: "800" },
});
