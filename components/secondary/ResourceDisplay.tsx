import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { resourceEmojis } from "../../src/config/resourceConfig";
import { ResourceType, Resources } from "../../src/types/resourceTypes";
import { formatAmount } from "../../utils/generalUtils";

interface Props {
  resources: Partial<Resources>;
  fontSize?: number;
  fontColor?: string;
  gap?: number;
}

export const ResourceDisplay = ({
  resources,
  fontSize = 16,
  fontColor = "white",
  gap = 12,
}: Props) => {
  return (
    <View style={[styles.container, { gap }]}>
      {[...Object.entries(resources)].reverse().map(([key, value]) => {
        const emoji = resourceEmojis[key as ResourceType];
        if (!emoji || value === null || value === 0) return null;

        return (
          <Text key={key} style={[styles.item, { fontSize, color: fontColor }]}>
            {emoji} {formatAmount(value)}
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
  },
  item: {
    marginRight: 8,
    color: "white",
  },
});
