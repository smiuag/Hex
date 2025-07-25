import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuestComponent from "../../components/main/QuestComponent";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function QuestScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <QuestComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
