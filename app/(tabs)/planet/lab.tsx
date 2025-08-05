import LabComponent from "@/components/main/LabComponent";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../../components/auxiliar/ResourceBar";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function ConstructionScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <LabComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
