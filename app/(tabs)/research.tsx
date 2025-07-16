import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ResearchComponent from "../../components/main/ResearchComponent";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ResearchComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
