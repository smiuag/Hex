import { isCombinedResourcesType } from "@/utils/resourceUtils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { resourceEmojis } from "../../src/config/emojisConfig";
import {
  CombinedResources,
  SPECIAL_TYPES,
  SpecialResourceType,
} from "../../src/types/resourceTypes";
import { formatAmount } from "../../utils/generalUtils";

interface Props {
  resources: CombinedResources;
  showOnlySpecial?: boolean;
  showOnlyNormal?: boolean;
  fontSize?: number;
  fontColor?: string;
  miniSyle?: boolean;
}

export const ResourceDisplay = ({
  resources,
  showOnlySpecial = false,
  showOnlyNormal = false,
  fontSize = 16,
  fontColor = "white",
  miniSyle = false,
}: Props) => {
  if (!resources) return null;

  const hasAnySpecialResource = SPECIAL_TYPES.some((type) => (resources[type] || 0) > 0);

  //Mostrar solo especiales
  if (showOnlySpecial) {
    return hasAnySpecialResource ? (
      <View style={[styles.container, { gap: 12 }]}>
        {SPECIAL_TYPES.map((type) => {
          const emoji = resourceEmojis[type];
          if (!emoji) return null;

          return (
            <Text key={`special-${type}`} style={[styles.item, { fontSize, color: fontColor }]}>
              {emoji} {formatAmount(resources[type] || 0)}
            </Text>
          );
        })}
      </View>
    ) : null;
  }

  //Mostrar solo normales
  if (showOnlyNormal) {
    return (
      <View style={[styles.container, miniSyle ? { gap: 6 } : { gap: 12 }]}>
        {[...Object.entries(resources)]
          .reverse()
          .filter(([key]) => !SPECIAL_TYPES.includes(key as SpecialResourceType))
          .map(([key, value]) => {
            if (!isCombinedResourcesType(key) || value == null || value === 0) return null;
            const emoji = resourceEmojis[key];
            if (!emoji) return null;

            return (
              <Text key={`normal-${key}`} style={[styles.item, { fontSize, color: fontColor }]}>
                {emoji} {formatAmount(value)}
              </Text>
            );
          })}
      </View>
    );
  }

  //Mostrar todos (por defecto)
  return (
    <View style={[styles.container, miniSyle ? { gap: 6 } : { gap: 12 }]}>
      {[...Object.entries(resources)].reverse().map(([key, value]) => {
        if (!isCombinedResourcesType(key) || value == null || value === 0) return null;
        const emoji = resourceEmojis[key];
        if (!emoji) return null;

        return (
          <Text key={`all-${key}`} style={[styles.item, { fontSize, color: fontColor }]}>
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
