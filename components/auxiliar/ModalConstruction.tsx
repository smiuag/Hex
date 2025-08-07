import { UnderConstructionCard } from "@/components/cards/UnderConstructionCard";
import { UpgradeCard } from "@/components/cards/UpgradeCard";
import { useGameContextSelector } from "@/src/context/GameContext";
import { useConstructionModalStore } from "@/src/store/modalStore";
import { BuildingType } from "@/src/types/buildingTypes";
import { getBuildTime } from "@/utils/buildingUtils";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function GlobalConstructionModal() {
  const hex = useConstructionModalStore((s) => s.hex);
  const visible = useConstructionModalStore((s) => s.isConstructionVisible);
  const close = useConstructionModalStore((s) => s.close);

  const research = useGameContextSelector((ctx) => ctx.research);
  const onBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const onCancel = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const onDestroy = useGameContextSelector((ctx) => ctx.handleDestroyBuilding);

  if (!visible || !hex) return null;

  const totalBuildTime = hex.construction
    ? getBuildTime(hex.construction.building, hex.construction.targetLevel)
    : 0;

  const { construction } = hex;

  return (
    <Pressable style={styles.overlay} onPress={close}>
      <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
        {construction ? (
          <UnderConstructionCard
            data={hex}
            onCancelBuild={() => {
              onCancel(hex.q, hex.r);
              close();
            }}
            onComplete={close}
            startedAt={construction.startedAt!}
            duration={totalBuildTime}
          />
        ) : (
          <UpgradeCard
            data={hex}
            onBuild={(type: BuildingType) => {
              onBuild(hex.q, hex.r, type);
              close();
            }}
            onDestroy={(q: number, r: number) => {
              onDestroy(q, r);
              close();
            }}
            research={research}
          />
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // asegúrate de que está por encima del SVG
  },
  modal: {
    borderRadius: 12,
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "white", // por si lo necesitas
  },
});
