import React from "react";
import { SafeAreaView } from "react-native";
import ConstructionComponent from "../../../components/main/ConstructionComponent";
import ResourceBar from "../../../components/secondary/ResourceBar";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function ConstructionScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ConstructionComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
