import React from "react";
import { Modal, Pressable } from "react-native";
import { hexStyles } from "../../src/styles/hexStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { Research } from "../../src/types/researchTypes";
import { getBuildTime } from "../../utils/buildingUtils";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

type Props = {
  visible: boolean;
  research: Research[];
  onClose: () => void;
  data: Hex | null;
  onBuild: (type: BuildingType) => void;
  onCancelBuild: () => void;
};

export default function ModalConstruction({
  visible,
  research,
  onClose,
  data,
  onBuild,
  onCancelBuild,
}: Props) {
  if (!data) return null;

  const totalBuildTime = data.construction
    ? getBuildTime(data.construction?.building, data.construction?.targetLevel)
    : 0;

  const { construction } = data;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={hexStyles.overlay} onPress={onClose}>
        <Pressable style={hexStyles.modalWrapper} onPress={(e) => e.stopPropagation()}>
          {construction ? (
            <UnderConstructionCard
              data={data}
              onCancelBuild={onCancelBuild}
              onComplete={onClose}
              startedAt={data.construction?.startedAt!}
              duration={totalBuildTime}
            ></UnderConstructionCard>
          ) : (
            <UpgradeCard data={data} onBuild={onBuild} research={research}></UpgradeCard>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
