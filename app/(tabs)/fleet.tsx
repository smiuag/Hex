import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import FleetComponent from "../../components/main/FleetComponent";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function GalaxyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FleetComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
