import FleetSelector from "@/components/auxiliar/FleetSelector";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function FleetScreen() {
  const params = useLocalSearchParams();
  const { systemId } = params;

  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();
  if (!isFocused) return null;
  if (!systemId) return;

  const targetSystemId = systemId as string;

  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <FleetSelector origin={"PLANET"} destination={targetSystemId} />
    </SafeAreaView>
  );
}
