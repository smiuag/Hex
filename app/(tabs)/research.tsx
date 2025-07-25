import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResearchComponent from "../../components/main/ResearchComponent";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function ResearchScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <ResearchComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
