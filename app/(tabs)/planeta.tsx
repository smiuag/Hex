import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import HexMap from "../../components/HexMap";
import ResourceBar from "../../components/ResourceBar";

export default function PlanetaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HexMap />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // opcional para que se note bien el modal
  },
});
