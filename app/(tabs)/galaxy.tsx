import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
