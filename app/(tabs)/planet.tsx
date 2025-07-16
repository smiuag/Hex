import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import PlanetComponent from "../../components/main/PlanetComponent";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function PlanetScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PlanetComponent />
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
