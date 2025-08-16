import { useGameContextSelector } from "@/src/context/GameContext";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../../components/auxiliar/ResourceBar";
import EmbassyComponent from "../../../components/main/EmbassyComponent";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function EmbassyScreen() {
  const insets = useSafeAreaInsets();
  const resources = useGameContextSelector((ctx) => ctx.resources);

  const isFocused = useIsFocused();
  if (!isFocused) return null;
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <EmbassyComponent />
      </GestureHandlerRootView>
      <ResourceBar storedResources={resources} showOnlyNormal={true} />
      <ResourceBar storedResources={resources} showOnlySpecial={true} miniSyle={true} />
    </SafeAreaView>
  );
}
