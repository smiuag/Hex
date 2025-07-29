import FleetSelector from "@/components/auxiliar/fleetSelector";
import { useGameContext } from "@/src/context/GameContext";
import { Ship } from "@/src/types/shipType";
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
  const { shipBuildQueue, starSystems, startAttack } = useGameContext();

  const system = starSystems.find((s) => s.id == systemId);
  const destinationImage = system!.image;

  const sendAttack = (selectedFleets: Ship[]) => {
    console.log(selectedFleets);
    if (selectedFleets.length > 0) {
      startAttack(system!.id, selectedFleets);
      router.replace("/galaxy");
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
          router.replace("/galaxy");
        }}
      />
    </SafeAreaView>
  );
}
