import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MenuComponent from "../../components/main/MenuComponent";
import Production from "../../components/secondary/Production";
import ResourceBar from "../../components/secondary/ResourceBar";

export default function MenuScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Production title="Producción / hora" titleColor="white" />
          <MenuComponent />
          <ResourceBar />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // fondo para visibilidad del área segura
  },
});
