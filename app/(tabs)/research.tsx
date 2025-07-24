import React from "react";
import { SafeAreaView } from "react-native";
import ResearchComponent from "../../components/main/ResearchComponent";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function ResearchScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ResearchComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
