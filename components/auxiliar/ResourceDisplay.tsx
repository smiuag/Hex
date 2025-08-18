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

  const rowGapStyle = miniSyle ? { gap: 6 } : { gap: 12 };

  const renderEntry = (key: string, value: number, prefix: string) => {
    if (!isCombinedResourcesType(key) || value == null || value === 0) return null;
    const emoji = (resourceEmojis as any)[key];
    if (!emoji) return null;
    return (
      <Text key={`${prefix}-${key}`} style={[styles.item, { fontSize, color: fontColor }]}>
        {emoji} {formatAmount(value)}
      </Text>
    );
  };

  const hasAnySpecialResource = SPECIAL_TYPES.some((type) => (resources[type] || 0) > 0);

  // ── Solo especiales
  if (showOnlySpecial) {
    return hasAnySpecialResource ? (
      <View style={[styles.row, rowGapStyle]}>
        {SPECIAL_TYPES.map((type) =>
          // aquí mantengo el comportamiento original: muestra todos los especiales si hay alguno (>0) en total
          renderEntry(type, resources[type] || 0, "special")
        )}
      </View>
    ) : null;
  }

  // ── Solo normales
  if (showOnlyNormal) {
    const normalEntries = Object.entries(resources)
      .reverse()
      .filter(
        ([key, value]) =>
          !SPECIAL_TYPES.includes(key as SpecialResourceType) && value && value !== 0
      );

    return (
      <View style={[styles.row, rowGapStyle]}>
        {normalEntries.map(([key, value]) => renderEntry(key, value as number, "normal"))}
      </View>
    );
  }

  // ── Mostrar todos (por defecto)
  const allEntries = Object.entries(resources)
    .reverse()
    .filter(([key, value]) => isCombinedResourcesType(key) && value && value !== 0);

  const specials = allEntries.filter(([key]) => SPECIAL_TYPES.includes(key as SpecialResourceType));
  const normals = allEntries.filter(([key]) => !SPECIAL_TYPES.includes(key as SpecialResourceType));
  const totalShown = specials.length + normals.length;

  // Si hay más de 5 tipos, dos filas: especiales y normales
  if (totalShown > 5 && (specials.length > 0 || normals.length > 0)) {
    return (
      <View style={styles.stack}>
        {specials.length > 0 && (
          <View style={[styles.row, rowGapStyle]}>
            {specials.map(([key, value]) => renderEntry(key, value as number, "all-special"))}
          </View>
        )}
        {normals.length > 0 && (
          <View style={[styles.row, rowGapStyle]}>
            {normals.map(([key, value]) => renderEntry(key, value as number, "all-normal"))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.row, rowGapStyle]}>
      {[...specials, ...normals].map(([key, value]) => renderEntry(key, value as number, "all"))}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    marginRight: 2,
    color: "white",
  },
});
