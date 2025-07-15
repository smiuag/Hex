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
  return (
    <View style={[styles.container, { gap }]}>
      {Object.entries(resources).map(([key, value]) => {
        const emoji = ResourceEmojis[key as ResourceType];
        if (!emoji || value === undefined) return null;

        return (
          <Text key={key} style={[styles.item, { fontSize }]}>
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
  },
  item: {
    marginRight: 8,
    color: "#333",
  },
});
