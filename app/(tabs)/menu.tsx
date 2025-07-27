import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResourceBar from "../../components/auxiliar/ResourceBar";
import MenuComponent from "../../components/main/MenuComponent";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { gameStarted } from "../../utils/configUtils";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  const { playerConfig } = useGameContext();
  const started = gameStarted(playerConfig);

  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <MenuComponent />
      {started && <ResourceBar />}
    </SafeAreaView>
  );
}
