import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import HexMap from "../../components/HexMap";
import ResourceBar from "../../components/ResourceBar";

export default function PlanetaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <HexMap />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
