import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlanetComponent from "../../../components/main/PlanetComponent";
import ResourceBar from "../../../components/secondary/ResourceBar";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function PlanetScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <PlanetComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
