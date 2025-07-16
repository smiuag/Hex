import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import GalaxyComponent from "../../components/main/GalaxyComponent";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function GalaxyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <GalaxyComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
