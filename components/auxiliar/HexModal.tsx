import { useGameContext } from "@/src/context/GameContext";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Modal, Pressable, Text, View } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { hexStyles } from "../../src/styles/hexStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { Research } from "../../src/types/researchTypes";
import {
  getBuildCost,
  getBuildTime,
  getProductionPerHour,
  isUnlocked,
} from "../../utils/buildingUtils";
import { formatDuration } from "../../utils/generalUtils";
import { ResourceDisplay } from "./ResourceDisplay";

type Props = {
  visible: boolean;
  research: Research[];
  onClose: () => void;
  data: Hex | null;
  onBuild: (type: BuildingType) => void;
  onCancelBuild: () => void;
};

export default function HexModal({
  visible,
  research,
  onClose,
  data,
  onBuild,
  onCancelBuild,
}: Props) {
  const { t } = useTranslation("common");
  const { t: tBuilding } = useTranslation("buildings");
  const { t: tResearch } = useTranslation("research");
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const { enoughResources } = useGameContext();

  useEffect(() => {
    if (!data?.construction) return;

    const { building: buildingUnderConstruction, startedAt, targetLevel } = data.construction;
    const totalBuildTime = getBuildTime(buildingUnderConstruction, targetLevel);

    const updateRemaining = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, totalBuildTime - elapsed);
      setRemainingTime(remaining);
      if (remaining <= 1) onClose();
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [data?.construction, onClose]);

  if (!data) return null;

  const { building, construction } = data;

  const renderUpgradeView = () => {
    if (!building) return null;

    const config = buildingConfig[building.type];
    const nextLevel = building.level + 1;
    const canUpgrade = isUnlocked(building.type, nextLevel, research);
    const cost = getBuildCost(building.type, nextLevel);
    const time = getBuildTime(building.type, nextLevel);
    const lockedByResources = !enoughResources(cost);
    const currentProduction = getProductionPerHour(building.type, building.level);
    const nextProduction = getProductionPerHour(building.type, nextLevel);
    const hasProduction = Object.values(nextProduction).some((v) => v > 0);
    const unmetRequirements =
      config.requiredResearch
        ?.filter((req) => req.builddingLevel <= nextLevel)
        .filter((req) => {
          const playerResearchLevel =
            research.find((r) => r.data.type === req.researchType)?.data.level ?? 0;
          return playerResearchLevel < req.researchLevelRequired;
        }) ?? [];

    const canBuild = canUpgrade && !lockedByResources;
    const isMaxLvl = config.maxLvl < (data.building ? data.building.level : 0);

    return (
      <ImageBackground
        source={config.imageBackground}
        style={commonStyles.cardPopUp}
        imageStyle={commonStyles.imageCoverPopUp}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleText}>{tBuilding(`buildingName.${building.type}`)}</Text>
            <Text style={commonStyles.subtitleText}>
              {tBuilding(`buildingDescription.${building.type}`)}
            </Text>
          </View>

          <Text style={commonStyles.whiteText}>
            {t("currentLevel")}: {building.level}
          </Text>

          {hasProduction && (
            <View style={commonStyles.rowResources}>
              <Text style={commonStyles.whiteText}>
                {t("productionLevel", { level: building.level })}
              </Text>
              <ResourceDisplay resources={currentProduction} fontSize={14} fontColor="white" />
            </View>
          )}

          {hasProduction && (
            <View style={commonStyles.rowResources}>
              <Text style={commonStyles.whiteText}>
                {t("productionLevel", { level: nextLevel })}
              </Text>
              <ResourceDisplay resources={nextProduction} fontSize={14} fontColor="white" />
            </View>
          )}

          <View style={commonStyles.rowResources}>
            <Text style={commonStyles.whiteText}>{t("cost")}:</Text>
            <ResourceDisplay resources={cost} fontSize={14} fontColor="white" />
          </View>

          {!canUpgrade && (
            <>
              <Text style={commonStyles.whiteText}>{t("buildTime")}:</Text>
              <Text style={commonStyles.whiteText}>{formatDuration(time)}</Text>
            </>
          )}

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
                <Text style={commonStyles.warningTextYellow}>⏱️ {formatDuration(time)}</Text>
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
              onPress={() => canBuild && onBuild(building.type)}
              disabled={!canBuild || isMaxLvl}
            >
              <Text style={commonStyles.buttonTextLight}>{t("upgrade")}</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  };

  const renderConstructionView = () => {
    if (!data?.construction || remainingTime === null) return null;

    const typeUnderConstruction = data.construction.building;
    const config = buildingConfig[typeUnderConstruction];
    const targetLevel = data.construction.targetLevel;
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
              <View style={commonStyles.rowResources}>
                <Text style={commonStyles.whiteText}>
                  {t("productionLevel", { level: targetLevel - 1 })}
                </Text>
                <ResourceDisplay resources={currentProduction} fontSize={14} fontColor="white" />
              </View>
            </>
          )}

          {hasProduction && (
            <View style={commonStyles.rowResources}>
              <Text style={commonStyles.whiteText}>
                {t("productionLevel", { level: targetLevel })}
              </Text>
              <ResourceDisplay resources={nextProduction} fontSize={14} fontColor="white" />
            </View>
          )}

          <View style={commonStyles.actionBar}>
            <Text style={commonStyles.warningTextYellow}>⏱️ {formatDuration(remainingTime)}</Text>
            <Pressable style={commonStyles.cancelButton} onPress={onCancelBuild}>
              <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={hexStyles.overlay} onPress={onClose}>
        <Pressable style={hexStyles.modalWrapper} onPress={(e) => e.stopPropagation()}>
          {construction ? renderConstructionView() : renderUpgradeView()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
