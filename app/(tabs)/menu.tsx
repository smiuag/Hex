import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../components/auxiliar/ResourceBar";
import MenuComponent from "../../components/main/MenuComponent";
import { commonStyles } from "../../src/styles/commonStyles";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <MenuComponent />
      <ResourceBar />
    </SafeAreaView>
  );
}
