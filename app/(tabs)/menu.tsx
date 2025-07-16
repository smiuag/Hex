import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import MenuComponent from "../../components/MenuComponent";
import ResourceBar from "../../components/ResourceBar";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <MenuComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
