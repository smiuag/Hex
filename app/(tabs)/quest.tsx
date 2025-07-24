import React from "react";
import { SafeAreaView } from "react-native";
import QuestComponent from "../../components/main/QuestComponent";
import ResourceBar from "../../components/secondary/ResourceBar";
import { commonStyles } from "../../src/styles/commonStyles";

export default function QuestScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <QuestComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
