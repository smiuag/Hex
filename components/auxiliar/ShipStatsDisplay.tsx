import { shipStatsEmojis } from "@/src/config/emojisConfig";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ShipStats {
  speed: number;
  attack: number;
  defense: number;
  health: number;
}

interface Props {
  stats: Partial<ShipStats>;
  fontSize?: number;
  fontColor?: string;
}

export const ShipStatsDisplay = ({ stats, fontSize = 16, fontColor = "white" }: Props) => {
  return (
    <View style={[styles.container, { gap: 12 }]}>
      {Object.entries(stats).map(([key, value]) => {
        const emoji = shipStatsEmojis[key];
        if (!emoji || value == null || value === 0) return null;

        return (
          <Text key={key} style={[styles.item, { fontSize, color: fontColor }]}>
            {emoji} {value}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    gap: 12,
  },
  item: {
    marginRight: 4,
    color: "white",
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
  },
});
