import ResourceBar from "@/components/auxiliar/ResourceBar";
import MenuComponent from "@/components/main/MenuComponent";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { gameStarted } from "@/utils/configUtils";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const resources = useGameContextSelector((ctx) => ctx.resources);
  const started = gameStarted(playerConfig);
  const isFocused = useIsFocused();

  if (!isFocused) return null;
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <MenuComponent />
      {started && <ResourceBar storedResources={resources} showOnlyNormal={true} />}
      {started && <ResourceBar storedResources={resources} showOnlySpecial={true} />}
    </SafeAreaView>
  );
}
