import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ResourceEmojis, ResourceType, Resources } from "../../data/tipos";
import { getFormatedValue } from "../../utils/resourceUtils";

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
        const emoji = ResourceEmojis[key as ResourceType];
        if (!emoji || value == null || value == 0) return null;

        return (
          <Text key={key} style={[styles.item, { fontSize, color: fontColor }]}>
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
    color: "white",
  },
});
