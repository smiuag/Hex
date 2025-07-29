import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../../components/auxiliar/ResourceBar";
import GalaxyComponent from "../../../components/main/GalaxyComponent";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function GalaxyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <GalaxyComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
