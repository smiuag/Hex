import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderCloseProps = {
  title: string;
  onClose: () => void;
  backgroundColor?: string;
  showDivider?: boolean;
};

export default function HeaderClose({
  title,
  onClose,
  backgroundColor = "#000",
  showDivider = true,
}: HeaderCloseProps) {
  const insets = useSafeAreaInsets();

  const router = useRouter();

  return (
    <View style={[{ backgroundColor }]}>
      <View style={[styles.row, showDivider && styles.rowDivider]}>
        <View style={styles.side} />
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityRole="header"
        >
          {title}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          hitSlop={12}
          style={({ pressed }) => [styles.side, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  side: {
    width: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    includeFontPadding: false,
  },
  closeText: {
    fontSize: 22,
    lineHeight: 22,
    color: "#fff",
  },
});
