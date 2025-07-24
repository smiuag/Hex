import { StoredResources } from "@/src/types/resourceTypes";
import React, { useEffect, useState } from "react";
import { ImageBackground, Modal, Pressable, Text, View } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { researchTechnologies } from "../../src/config/researchConfig";
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
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "./ResourceDisplay";

type Props = {
  visible: boolean;
  research: Research[];
  onClose: () => void;
  resources: StoredResources;
  data: Hex | null;
  onBuild: (type: BuildingType) => void;
  onCancelBuild: () => void;
};

export default function HexModal({
  visible,
  research,
  onClose,
  resources,
  data,
  onBuild,
  onCancelBuild,
}: Props) {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!data?.construction) return;

    const {
      building: buildingUnderConstruction,
      startedAt,
      targetLevel,
    } = data.construction;
    const totalBuildTime = getBuildTime(buildingUnderConstruction, targetLevel);

    const updateRemaining = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, totalBuildTime - elapsed);
      setRemainingTime(remaining);

      if (remaining <= 1) {
        onClose();
      }
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
    const enoughResources = hasEnoughResources(resources, cost);
    const currentProduction = getProductionPerHour(
      building.type,
      building.level
    );
    const nextProduction = getProductionPerHour(building.type, nextLevel);
    const hasProduction = Object.values(nextProduction).some((v) => v > 0);
    const unmetRequirements =
      config.requiredResearch
        ?.filter((req) => req.builddingLevel <= nextLevel)
        .filter((req) => {
          const playerResearchLevel =
            research.find((r) => r.data.type === req.researchType)?.data
              .level ?? 0;
          return playerResearchLevel < req.researchLevelRequired;
        }) ?? [];

    const canBuild = canUpgrade && enoughResources;

    return (
      <ImageBackground
        source={config.imageBackground}
        style={commonStyles.cardPopUp}
        imageStyle={commonStyles.imageCoverPopUp}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleText}>{config.name}</Text>
            <Text style={commonStyles.subtitleText}>{config.description}</Text>
          </View>
          <View>
            <Text style={commonStyles.whiteText}>
              Nivel actual: {building.level}
            </Text>

            {hasProduction && (
              <View style={commonStyles.rowResources}>
                <Text style={commonStyles.whiteText}>
                  Producción (Nv {building.level}):
                </Text>
                <View>
                  <ResourceDisplay
                    resources={currentProduction}
                    fontSize={14}
                    fontColor="white"
                  />
                </View>
              </View>
            )}

            {hasProduction && (
              <View style={commonStyles.rowResources}>
                <Text style={commonStyles.whiteText}>
                  Producción (Nv {nextLevel}):
                </Text>
                <View>
                  <ResourceDisplay
                    resources={nextProduction}
                    fontSize={14}
                    fontColor="white"
                  />
                </View>
              </View>
            )}

            <View style={commonStyles.rowResources}>
              <Text style={commonStyles.whiteText}>Coste:</Text>
              <ResourceDisplay
                resources={cost}
                fontSize={14}
                fontColor="white"
              />
            </View>
          </View>
          {!canUpgrade && (
            <>
              <Text style={commonStyles.whiteText}>
                Tiempo de construcción:
              </Text>
              <Text style={commonStyles.whiteText}>{formatDuration(time)}</Text>
            </>
          )}

          <View style={commonStyles.actionBar}>
            {canUpgrade ? (
              !enoughResources ? (
                <Text style={[commonStyles.warningTextYellow]}>
                  ⚠️ Recursos insuficientes
                </Text>
              ) : (
                <Text style={commonStyles.warningTextYellow}>
                  ⏱️ {formatDuration(time)}
                </Text>
              )
            ) : (
              <Text style={commonStyles.errorTextRed}>
                {unmetRequirements
                  .map(
                    (r) =>
                      `🔒 ${researchTechnologies[r.researchType].name} Nv ${
                        r.researchLevelRequired
                      }`
                  )
                  .join("\n")}
              </Text>
            )}

            <Pressable
              style={[
                commonStyles.buttonPrimary,
                !canBuild && commonStyles.buttonDisabled,
              ]}
              onPress={() => canBuild && onBuild(building.type)}
              disabled={!canBuild}
            >
              <Text style={commonStyles.buttonTextLight}>Mejorar</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  };

  const renderConstructionView = () => {
    if (!data?.construction || remainingTime === null) return null;

    const typeUnderConstrucion = data.construction.building;

    const config = buildingConfig[typeUnderConstrucion];
    const targetLevel = data.construction.targetLevel;
    const currentProduction = getProductionPerHour(
      typeUnderConstrucion,
      targetLevel
    );
    const nextProduction = getProductionPerHour(
      typeUnderConstrucion,
      targetLevel + 1
    );
    const hasProduction = Object.values(nextProduction).some((v) => v > 0);

    return (
      <ImageBackground
        source={config.imageBackground}
        style={commonStyles.cardPopUp}
        imageStyle={commonStyles.imageCoverPopUp}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleText}>{config.name}</Text>
            <Text style={commonStyles.subtitleText}>{config.description}</Text>
          </View>
          <View>
            {hasProduction && targetLevel > 1 && (
              <>
                <Text style={commonStyles.whiteText}>
                  Nivel actual: {targetLevel - 1}
                </Text>
                <View style={commonStyles.rowResources}>
                  <Text style={commonStyles.whiteText}>
                    Producción (Nv {targetLevel - 1}):
                  </Text>
                  <View>
                    <ResourceDisplay
                      resources={currentProduction}
                      fontSize={14}
                      fontColor="white"
                    />
                  </View>
                </View>
              </>
            )}
            {hasProduction && (
              <View style={commonStyles.rowResources}>
                <Text style={commonStyles.whiteText}>
                  Producción (Nv {targetLevel}):
                </Text>
                <View>
                  <ResourceDisplay
                    resources={nextProduction}
                    fontSize={14}
                    fontColor="white"
                  />
                </View>
              </View>
            )}
          </View>
          <View style={commonStyles.actionBar}>
            <Text style={commonStyles.warningTextYellow}>
              ⏱️ {formatDuration(remainingTime)}
            </Text>

            <Pressable
              style={commonStyles.cancelButton}
              onPress={onCancelBuild}
            >
              <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={hexStyles.overlay} onPress={onClose}>
        <Pressable
          style={hexStyles.modalWrapper}
          onPress={(e) => e.stopPropagation()}
        >
          {construction ? renderConstructionView() : renderUpgradeView()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
