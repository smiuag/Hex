import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ResourceEmojis, ResourceType, Resources } from "../data/tipos";

interface Props {
  resources: Resources;
  fontSize?: number;
  gap?: number;
}

export const ResourceDisplay = ({
  resources,
  fontSize = 16,
  gap = 12,
}: Props) => {
  const getFormatedValue = (value: number): string => {
    const format = (val: number, suffix: string): string => {
      const truncated = Math.floor(val * 10) / 10;
      return (
        (truncated % 1 === 0 ? truncated.toFixed(0) : truncated.toFixed(1)) +
        suffix
      );
    };

    if (value >= 1_000_000_000) {
      return format(value / 1_000_000_000, "B");
    }
    if (value >= 1_000_000) {
      return format(value / 1_000_000, "M");
    }
    if (value >= 1_000) {
      return format(value / 1_000, "K");
    }
    return value.toString();
  };

  return (
    <View style={[styles.container, { gap }]}>
      {Object.entries(resources).map(([key, value]) => {
        const emoji = ResourceEmojis[key as ResourceType];
        if (!emoji || value === undefined) return null;

        return (
          <Text key={key} style={[styles.item, { fontSize }]}>
            {emoji} {getFormatedValue(value)}
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
    color: "#333",
  },
});
