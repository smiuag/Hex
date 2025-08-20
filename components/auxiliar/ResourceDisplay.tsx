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

  const renderRowFromEntries = (entries: Array<[string, number]>, prefix: string) => {
    const pieces = entries
      .filter(([key, value]) => isCombinedResourcesType(key) && value && value !== 0)
      .map(([key, value]) => {
        const emoji = (resourceEmojis as any)[key];
        if (!emoji) return null;
        return `${emoji} ${formatAmount(value)}`;
      })
      .filter(Boolean) as string[];

    if (pieces.length === 0) return null;

    const concatenatedText = pieces.join(" ");
    const len = concatenatedText.length;

    // Escalado progresivo por longitud total (ajusta umbrales y factores a tu gusto)
    let dynamicFontSize = fontSize;
    if (len > 70) dynamicFontSize = fontSize * 0.75;
    else if (len > 60) dynamicFontSize = fontSize * 0.8;
    else if (len > 50) dynamicFontSize = fontSize * 0.9;

    return (
      <Text
        key={`row-${prefix}`}
        style={[styles.item, { fontSize: dynamicFontSize, color: fontColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {concatenatedText}
      </Text>
    );
  };

  const hasAnySpecialResource = SPECIAL_TYPES.some((type) => (resources[type] || 0) > 0);

  // ── Solo especiales
  if (showOnlySpecial) {
    if (!hasAnySpecialResource) return null;
    const specialsOnly = SPECIAL_TYPES.map<[string, number]>((type) => [
      type,
      resources[type] || 0,
    ]).filter(([, value]) => value && value !== 0);

    return (
      <View style={[styles.container]}>
        <View style={[styles.row, rowGapStyle]}>
          {renderRowFromEntries(specialsOnly, "special")}
        </View>
      </View>
    );
  }

  // ── Solo normales
  if (showOnlyNormal) {
    const normalEntries = Object.entries(resources)
      .reverse()
      .filter(
        ([key, value]) =>
          !SPECIAL_TYPES.includes(key as SpecialResourceType) && value && value !== 0
      ) as Array<[string, number]>;

    return (
      <View style={[styles.container]}>
        <View style={[styles.row, rowGapStyle]}>
          {renderRowFromEntries(normalEntries, "normal")}
        </View>
      </View>
    );
  }

  // ── Mostrar todos (por defecto)
  const allEntries = Object.entries(resources)
    .reverse()
    .filter(([key, value]) => isCombinedResourcesType(key) && value && value !== 0) as Array<
    [string, number]
  >;

  const specials = allEntries.filter(([key]) => SPECIAL_TYPES.includes(key as SpecialResourceType));
  const normals = allEntries.filter(([key]) => !SPECIAL_TYPES.includes(key as SpecialResourceType));
  const totalShown = specials.length + normals.length;

  if (totalShown > 5 && (specials.length > 0 || normals.length > 0)) {
    return (
      <View style={[styles.container]}>
        {specials.length > 0 && (
          <View style={[styles.row, rowGapStyle]}>
            {renderRowFromEntries(specials, "all-special")}
          </View>
        )}
        {normals.length > 0 && (
          <View style={[styles.row, rowGapStyle]}>
            {renderRowFromEntries(normals, "all-normal")}
          </View>
        )}
      </View>
    );
  }

  const combined = [...specials, ...normals];

  return (
    <View style={[styles.container]}>
      <View style={[styles.row, rowGapStyle]}>{renderRowFromEntries(combined, "all")}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor raíz: no crece, puede encoger, no ocupa 100% por defecto y no desborda
  container: {
    alignSelf: "auto",
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: "100%",
    overflow: "hidden",
  },
  // Pila vertical sin obligar a ocupar todo el ancho
  stack: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    // width: "100%", // ← Quitado para no invadir ancho de los hermanos
  },
  // Fila ajustada: no fuerza ancho completo, puede encoger, sin wrap externo
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 0,
    flexShrink: 1,
    // width: "100%", // ← Quitado
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  item: {
    marginRight: 2,
    color: "white",
  },
});
