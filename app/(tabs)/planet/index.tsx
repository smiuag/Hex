import React from "react";
import { SafeAreaView } from "react-native";
import PlanetComponent from "../../../components/main/PlanetComponent";
import ResourceBar from "../../../components/secondary/ResourceBar";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function PlanetScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PlanetComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
