import { isCombinedResourcesType } from "@/utils/resourceUtils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { resourceEmojis } from "../../src/config/emojisConfig";
import { CombinedResources, SPECIAL_TYPES } from "../../src/types/resourceTypes";
import { formatAmount } from "../../utils/generalUtils";

interface Props {
  resources: CombinedResources;
  showOnlySpecial?: boolean;
  fontSize?: number;
  fontColor?: string;
}

export const ResourceDisplay = ({
  resources,
  showOnlySpecial = false,
  fontSize = 16,
  fontColor = "white",
}: Props) => {
  return showOnlySpecial ? (
    <View style={[styles.container, { gap: 12 }]}>
      {SPECIAL_TYPES.map((type) => {
        const emoji = resourceEmojis[type];
        if (!emoji) return null;

        return (
          <Text key={type} style={[styles.item, { fontSize, color: fontColor }]}>
            {emoji} {formatAmount(resources[type] || 0)}
          </Text>
        );
      })}
    </View>
  ) : (
    <View style={[styles.container, { gap: 12 }]}>
      {[...Object.entries(resources)].reverse().map(([key, value]) => {
        if (!isCombinedResourcesType(key) || value == null || value === 0) return null;
        const emoji = resourceEmojis[key];
        if (!emoji) return null;
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
    marginRight: 2,
    color: "white",
  },
});
