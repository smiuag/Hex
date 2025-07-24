import React from "react";
import { SafeAreaView } from "react-native";
import GalaxyComponent from "../../components/main/GalaxyComponent";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function GalaxyScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <GalaxyComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
