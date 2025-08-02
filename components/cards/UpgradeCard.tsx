import { useGameContext } from "@/src/context/GameContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { Research } from "../../src/types/researchTypes";
import {
  getBuildCost,
  getBuildTime,
  getProductionPerHour,
  getUnmetRequirements,
} from "../../utils/buildingUtils";
import { formatDuration } from "../../utils/generalUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  data: Hex;
  research: Research[];
  onBuild: (type: BuildingType) => void;
};

export const UpgradeCard: React.FC<Props> = ({ data, research, onBuild }) => {
  const { t } = useTranslation("common");
  const { t: tBuilding } = useTranslation("buildings");
  const { t: tResearch } = useTranslation("research");
  const { enoughResources } = useGameContext();

  if (!data.building) return null;

  const config = buildingConfig[data.building.type];
  const nextLevel = data.building.level + 1;
  const cost = getBuildCost(data.building.type, nextLevel);
  const time = getBuildTime(data.building.type, nextLevel);
  const lockedByResources = !enoughResources(cost);
  const currentProduction = getProductionPerHour(data.building.type, data.building.level);
  const nextProduction = getProductionPerHour(data.building.type, nextLevel);
  const hasProduction = Object.values(nextProduction).some((v) => v > 0);
  const unmetRequirements = getUnmetRequirements(config.requiredResearch, research, nextLevel);
  const canUpgrade = unmetRequirements.length == 0;
  const canBuild = canUpgrade && !lockedByResources;
  const isMaxLvl = config.maxLvl < (data.building?.level ?? 0);

  return (
    <ImageBackground
      source={config.imageBackground}
      style={commonStyles.cardPopUp}
      imageStyle={commonStyles.imageCoverPopUp}
    >
      <View style={commonStyles.overlayDark}>
        <View>
          <Text style={commonStyles.titleText}>
            {tBuilding(`buildingName.${data.building.type}`)}
          </Text>
          <Text style={commonStyles.subtitleText}>
            {tBuilding(`buildingDescription.${data.building.type}`)}
          </Text>
        </View>

        <Text style={commonStyles.whiteText}>
          {t("currentLevel")}: {data.building.level}
        </Text>

        {hasProduction && (
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>
              {t("productionLevel", { level: data.building.level })}
            </Text>
            <ResourceDisplay resources={currentProduction} fontSize={14} fontColor="white" />
          </View>
        )}

        {hasProduction && (
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>{t("productionLevel", { level: nextLevel })}</Text>
            <ResourceDisplay resources={nextProduction} fontSize={14} fontColor="white" />
          </View>
        )}

        <View style={commonStyles.rowSpaceBetween}>
          <Text style={commonStyles.whiteText}>{t("cost")}:</Text>
          <ResourceDisplay resources={cost} fontSize={14} fontColor="white" />
        </View>

        <View style={commonStyles.actionBar}>
          {isMaxLvl ? (
            <Text style={commonStyles.errorTextRed}>
              {unmetRequirements
                .map((r) => `🔒 ${tResearch("maxLvl")} ${t("level")} ${r.researchLevelRequired}`)
                .join("\n")}
            </Text>
          ) : canUpgrade ? (
            lockedByResources ? (
              <Text style={commonStyles.warningTextYellow}>⚠️ {t("notEnoughResources")}</Text>
            ) : (
              <Text style={commonStyles.warningTextYellow}>⏳ {formatDuration(time)}</Text>
            )
          ) : (
            <Text style={commonStyles.errorTextRed}>
              {unmetRequirements
                .map(
                  (r) =>
                    `🔒 ${tResearch(`researchName.${r.researchType}`)} ${t("level")} ${
                      r.researchLevelRequired
                    }`
                )
                .join("\n")}
            </Text>
          )}

          <Pressable
            style={[commonStyles.buttonPrimary, !canBuild && commonStyles.buttonDisabled]}
            onPress={() => canBuild && onBuild(data.building!.type)}
            disabled={!canBuild || isMaxLvl}
          >
            <Text style={commonStyles.buttonTextLight}>{t("upgrade")}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};
