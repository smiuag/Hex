import FleetSelector from "@/components/auxiliar/fleetSelector";
import { useGameContextSelector } from "@/src/context/GameContext";
import { Ship } from "@/src/types/shipType";
import { getSystemImage } from "@/utils/starSystemUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { IMAGES } from "../../../src/constants/images";
import { commonStyles } from "../../../src/styles/commonStyles";

export default function FleetScreen() {
  const params = useLocalSearchParams();
  const { systemId } = params;

  if (!systemId) return;

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const starSystems = useGameContextSelector((ctx) => ctx.starSystems);
  const startAttack = useGameContextSelector((ctx) => ctx.startAttack);

  const system = starSystems.find((s) => s.id == systemId);

  const destinationImage = getSystemImage(system!.type);

  const sendAttack = (selectedFleets: Ship[]) => {
    if (selectedFleets.length > 0) {
      startAttack(system!.id, selectedFleets);
      router.replace("/(tabs)/galaxy");
    } else
      Toast.show({
        type: "info",
        text1: "No se puede enviar una flota vacía",
        position: "top",
        visibilityTime: 2000,
      });
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea, { paddingTop: insets.top }]}>
      <FleetSelector
        fleets={shipBuildQueue}
        originImage={IMAGES.BACKGROUND_MENU_IMAGE}
        destinationImage={destinationImage}
        onConfirm={(selectedFleets) => {
          sendAttack(selectedFleets);
        }}
        onCancel={() => {
          router.replace("/(tabs)/galaxy");
        }}
      />
    </SafeAreaView>
  );
}
