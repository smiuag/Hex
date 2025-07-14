// components/ResourceBar.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGameContext } from "../src/context/GameContext";

export default function ResourceBar() {
  const { resources } = useGameContext();
  if (!resources) return null;

  return (
    <View style={styles.container}>
      {Object.entries(resources.resources).map(([key, value]) => (
        <View key={key} style={styles.resourceItem}>
          <Text style={styles.label}>{key.toUpperCase()}:</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  label: {
    fontWeight: "bold",
    marginRight: 4,
  },
  value: {
    fontSize: 16,
  },
});
