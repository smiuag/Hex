import AchievementsComponent from "@/components/main/AchievementsComponent";
import { commonStyles } from "@/src/styles/commonStyles";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();

  if (!isFocused) return null;
  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <AchievementsComponent />
    </SafeAreaView>
  );
}
