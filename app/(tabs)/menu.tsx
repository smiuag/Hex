import React from "react";
import { SafeAreaView } from "react-native";
import MenuComponent from "../../components/main/MenuComponent";
import Production from "../../components/secondary/Production";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function MenuScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Production title="Producción" titleColor="white" />
      <MenuComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
