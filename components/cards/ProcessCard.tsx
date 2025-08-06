import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { Process } from "../../src/types/processTypes";
import { ResearchType } from "../../src/types/researchTypes";
import { ShipType } from "../../src/types/shipType";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type ProcessCardProps = {
  item: Process;
  onCancelBuild: (q: number, r: number) => Promise<void>;
  onCancelResearch: (type: ResearchType) => Promise<void>;
  onCancelShip: (shipType: ShipType) => Promise<void>;
  onCancelExploreSystem: (id: string) => Promise<void>;
  onCancelAttack: (id: string) => Promise<void>;
  onCancelCollect: (id: string) => Promise<void>;
};

export function ProcessCard({
  item,
  onCancelBuild,
  onCancelResearch,
  onCancelShip,
  onCancelExploreSystem,
  onCancelAttack,
  onCancelCollect,
}: ProcessCardProps) {
  const { t } = useTranslation("common");

  const handleCancel = async () => {
    if (item.type === "BUILDING") {
      await onCancelBuild(item.q!, item.r!);
    } else if (item.type === "RESEARCH") {
      await onCancelResearch(item.researchType!);
    } else if (item.type === "SHIP") {
      await onCancelShip(item.shipType!);
    } else if (item.type === "EXPLORATION SYSTEM FLEET") {
      await onCancelExploreSystem(item.explorationSystemId!);
    } else if (item.type === "ATTACK FLEET") {
      await onCancelAttack(item.attackSystemId!);
    } else if (item.type === "COLLECT") {
      await onCancelCollect(item.collectSystemId!);
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
            {item.type !== "RETURN FLEET" ? (
              <View style={commonStyles.rowSpaceBetween}>
                <TouchableOpacity style={commonStyles.buttonDanger} onPress={handleCancel}>
                  <Text style={commonStyles.buttonTextLight}>{t("cancel")}</Text>
                </TouchableOpacity>
                {item.resources ? <ResourceDisplay resources={item.resources} /> : <View></View>}
              </View>
            ) : (
              <View></View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
