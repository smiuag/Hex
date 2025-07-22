import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import QuestComponent from "../../components/main/QuestComponent";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function QuestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <QuestComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
