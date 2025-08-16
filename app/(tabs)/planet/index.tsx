import { useGameContextSelector } from "@/src/context/GameContext";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../../components/auxiliar/ResourceBar";
import PlanetComponent from "../../../components/main/PlanetComponent";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function PlanetScreen() {
  const insets = useSafeAreaInsets();
  const resources = useGameContextSelector((ctx) => ctx.resources);

  const isFocused = useIsFocused();
  if (!isFocused) return null;
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <PlanetComponent />
      <ResourceBar storedResources={resources} showOnlyNormal={true} />
      <ResourceBar storedResources={resources} showOnlySpecial={true} miniSyle={true} />
    </SafeAreaView>
  );
}
