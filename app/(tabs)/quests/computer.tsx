import { useGameContextSelector } from "@/src/context/GameContext";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ComputerComponent from "../../../components/main/ComputerComponent";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function ComputerScreen() {
  const insets = useSafeAreaInsets();
  const resources = useGameContextSelector((ctx) => ctx.resources);

  const isFocused = useIsFocused();
  if (!isFocused) return null;
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <ComputerComponent />
    </SafeAreaView>
  );
}
