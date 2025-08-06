import { shipStatsEmojis } from "@/src/config/emojisConfig";
import { commonStyles } from "@/src/styles/commonStyles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ShipStats {
  SPEED: number;
  ATTACK: number;
  DEFENSE: number;
  HP: number;
}

interface Props {
  stats: Partial<ShipStats>;
  fontSize?: number;
  fontColor?: string;
  showSpeed?: boolean;
}

export const ShipStatsDisplay = ({
  stats,
  fontSize = 16,
  fontColor = "white",
  showSpeed = true,
}: Props) => {
  return (
    <View style={[styles.container, { gap: 12 }]}>
      {Object.entries(stats).map(([key, value]) => {
        const emoji = shipStatsEmojis[key];
        if (!emoji || value == null) return null;

        return (
          (showSpeed || key !== "SPEED") && (
            <View key={key} style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.item, { fontSize, color: fontColor }]}>{emoji}</Text>
              <View style={[commonStyles.minWidth25, { marginLeft: 4 }]}>
                <Text style={commonStyles.whiteText}>{value}</Text>
              </View>
            </View>
          )
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
    paddingHorizontal: 4,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    gap: 12,
  },
  item: {
    marginRight: 2,
    color: "white",
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
  },
});
