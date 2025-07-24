import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { ResourceDisplay } from "./ResourceDisplay";

type ResourceBarProps = {
  title?: string;
  fontSize?: number;
  titleColor?: string;
  resourceColor?: string;
};

export default function ProductionBar({
  title,
  fontSize = 14,
  titleColor = "#fff",
  resourceColor = "#fff",
}: ResourceBarProps) {
  const { resources } = useGameContext();

  const productionPerHour = Object.fromEntries(
    Object.entries(resources?.production ?? {}).map(([key, value]) => [
      key,
      Math.round(value * 3600),
    ])
  );

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      )}
      <View style={styles.resourcesContainer}>
        <ResourceDisplay
          resources={productionPerHour}
          fontSize={fontSize}
          fontColor={resourceColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    minHeight: 40, // o 44, 48 para que tenga tamaño visible
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
  },
  resourcesContainer: {
    flexDirection: "row",
  },
});
