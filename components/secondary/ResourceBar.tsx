// components/ResourceBar.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { ResourceDisplay } from "./ResourceDisplay";

export default function ResourceBar() {
  const { resources } = useGameContext();
  if (!resources) return null;

  return (
    <View style={styles.container}>
      <View>
        <ResourceDisplay resources={resources.resources} fontSize={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  label: {
    fontWeight: "bold",
    color: "white",
    marginRight: 4,
  },
  value: {
    fontSize: 16,
  },
});
