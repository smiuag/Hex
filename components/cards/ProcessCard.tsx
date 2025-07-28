import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { Process } from "../../src/types/processTypes";
import { ResearchType } from "../../src/types/researchTypes";
import { ShipType } from "../../src/types/shipType";
import { CountdownTimer } from "../auxiliar/CountdownTimer";

type ProcessCardProps = {
  item: Process;
  onCancelBuild: (q: number, r: number) => Promise<void>;
  onCancelResearch: (type: ResearchType) => Promise<void>;
  onCancelShip: (shipType: ShipType) => Promise<void>;
};

export function ProcessCard({
  item,
  onCancelBuild,
  onCancelResearch,
  onCancelShip,
}: ProcessCardProps) {
  const { t } = useTranslation("common");

  const handleCancel = async () => {
    if (item.type === "BUILDING") {
      await onCancelBuild(item.q!, item.r!);
    } else if (item.type === "RESEARCH") {
      await onCancelResearch(item.researchType!);
    } else if (item.type === "SHIP") {
      await onCancelShip(item.shipType!);
    }
  };

  return (
    <View style={commonStyles.pt5}>
      <ImageBackground
        source={item.image}
        style={commonStyles.cardMini}
        imageStyle={[commonStyles.imageCover]}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.headerRow}>
            <Text style={commonStyles.titleText}>{item.name}</Text>
          </View>
          <View style={commonStyles.actionBar}>
            <View>
              <Text>
                ⏳ <CountdownTimer startedAt={item.startedAt} duration={item.duration} />
              </Text>
            </View>
            <TouchableOpacity style={commonStyles.buttonDanger} onPress={handleCancel}>
              <Text style={commonStyles.buttonTextLight}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
