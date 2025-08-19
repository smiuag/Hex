import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
  emoji?: string;
};

type Props<T extends string> = {
  value: T;
  onChange?: (v: T) => void; // opcional
  options: readonly SegmentedOption<T>[];
  compact?: boolean;
  disabled?: boolean; // opcional
};

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  compact = false,
  disabled = false,
}: Props<T>) {
  const isDisabledAll = disabled || !onChange;

  return (
    <View
      style={[
        styles.segment,
        compact && styles.segmentCompact,
        isDisabledAll && styles.segmentDisabled,
      ]}
      accessibilityRole="radiogroup"
    >
      {options.map((opt) => {
        const active = value === opt.value;

        return (
          <Pressable
            key={opt.value}
            onPress={() => !isDisabledAll && onChange?.(opt.value)}
            disabled={isDisabledAll}
            style={[
              styles.segmentBtn,
              compact && styles.segmentBtnCompact,
              active && styles.segmentBtnActive,
              isDisabledAll && styles.segmentBtnDisabled,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: isDisabledAll }}
          >
            <Text
              style={[
                styles.segmentText,
                compact && styles.segmentTextCompact,
                active && styles.segmentTextActive,
                isDisabledAll && styles.segmentTextDisabled,
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
  segmentDisabled: { opacity: 0.6 },

  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentBtnCompact: { paddingVertical: 6 },
  segmentBtnActive: {
    backgroundColor: "rgba(46, 73, 120, 0.55)",
    borderWidth: 1,
    borderColor: "#5c9cf6ff",
    shadowColor: "#5c69f6ff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  segmentBtnDisabled: {},

  segmentText: { color: "#cfd6ff", fontWeight: "600" },
  segmentTextCompact: { fontSize: 12 },
  segmentTextActive: { color: "#ffffff", fontWeight: "800" },
  segmentTextDisabled: { opacity: 0.9 },
});
