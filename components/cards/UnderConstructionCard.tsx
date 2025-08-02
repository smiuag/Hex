import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { Hex } from "../../src/types/hexTypes";
import { getProductionPerHour } from "../../utils/buildingUtils";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  data: Hex;
  onCancelBuild: () => void;
  onComplete?: () => void;
  startedAt: number;
  duration: number;
};

export const UnderConstructionCard: React.FC<Props> = ({
  data,
  onCancelBuild,
  onComplete,
  startedAt,
  duration,
}) => {
  const { t } = useTranslation("common");
  const { t: tBuilding } = useTranslation("buildings");

  const typeUnderConstruction = data.construction!.building;
  const config = buildingConfig[typeUnderConstruction];
  const targetLevel = data.construction!.targetLevel;
  const currentProduction = getProductionPerHour(typeUnderConstruction, targetLevel);
  const nextProduction = getProductionPerHour(typeUnderConstruction, targetLevel + 1);
  const hasProduction = Object.values(nextProduction).some((v) => v > 0);

  return (
    <ImageBackground
      source={config.imageBackground}
      style={commonStyles.cardPopUp}
      imageStyle={commonStyles.imageCoverPopUp}
    >
      <View style={commonStyles.overlayDark}>
        <View>
          <Text style={commonStyles.titleText}>
            {tBuilding(`buildingName.${typeUnderConstruction}`)}
          </Text>
          <Text style={commonStyles.subtitleText}>
            {tBuilding(`buildingDescription.${typeUnderConstruction}`)}
          </Text>
        </View>

        {hasProduction && targetLevel > 1 && (
          <>
            <Text style={commonStyles.whiteText}>
              {t("currentLevel")}: {targetLevel - 1}
            </Text>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>
                {t("productionLevel", { level: targetLevel - 1 })}
              </Text>
              <ResourceDisplay resources={currentProduction} fontSize={14} fontColor="white" />
            </View>
          </>
        )}

        {hasProduction && (
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>
              {t("productionLevel", { level: targetLevel })}
            </Text>
            <ResourceDisplay resources={nextProduction} fontSize={14} fontColor="white" />
          </View>
        )}

        <View style={commonStyles.actionBar}>
          <Text style={commonStyles.warningTextYellow}>
            ⏳{" "}
            <CountdownTimer
              startedAt={startedAt}
              duration={duration}
              onComplete={onComplete}
            ></CountdownTimer>
          </Text>
          <Pressable style={commonStyles.cancelButton} onPress={onCancelBuild}>
            <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};
