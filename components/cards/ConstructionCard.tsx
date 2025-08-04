import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Resources } from "../../src/types/resourceTypes";
import { formatDuration } from "../../utils/generalUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

interface Requirement {
  researchType: string;
  researchLevelRequired: number;
  builddingLevel: number;
}

interface Props {
  item: {
    type: BuildingType;
    name: string;
    description: string;
    image: any;
    cost: Partial<Resources>;
    time: number;
    available: boolean;
    lockedByMax: boolean;
    unmetRequirements: Requirement[];
    requirements: Requirement[];
    lockedByResources: boolean;
  };
  onBuild: (type: BuildingType) => void;
  research: any[];
}

export const ConstructionCard: React.FC<Props> = ({ item, onBuild, research }) => {
  const unmetVisible = item.unmetRequirements.length > 0;
  const { t } = useTranslation("common");
  const { t: tResearch } = useTranslation("research");
  const { t: tBuilding } = useTranslation("buildings");
  console.log("Montado ConstructionCard");

  const filteredRequirements = Object.values(
    item.requirements
      .filter((req) => req.builddingLevel <= 1)
      .reduce((acc: Record<string, Requirement>, req) => {
        const existing = acc[req.researchType];
        if (!existing || req.researchLevelRequired > existing.researchLevelRequired) {
          acc[req.researchType] = req;
        }
        return acc;
      }, {})
  ).filter((req) => {
    const currentLevel = research.find((r) => r.data.type === req.researchType)?.data.level ?? 0;
    return currentLevel < req.researchLevelRequired;
  });

  return (
    <View style={commonStyles.cardContainer}>
      <ImageBackground
        source={item.image}
        style={[commonStyles.card]}
        imageStyle={[commonStyles.imageCover, !item.available && commonStyles.imageUnavailable]}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleText}>{tBuilding(`buildingName.${item.type}`)}</Text>
            <Text style={commonStyles.subtitleText}>
              {tBuilding(`buildingDescription.${item.type}`)}
            </Text>
          </View>
          <View>
            <ResourceDisplay resources={item.cost} fontSize={13} />
            {unmetVisible ? (
              <View style={commonStyles.actionBar}>
                <View>
                  {filteredRequirements.map((r, i) => (
                    <Text key={i} style={commonStyles.errorTextRed}>
                      🔒 {tResearch(`researchName.${r.researchType}`)} {t("level")}{" "}
                      {r.researchLevelRequired}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  style={[commonStyles.buttonPrimary, commonStyles.buttonDisabled]}
                  disabled={true}
                >
                  <Text style={commonStyles.buttonTextLight}>Construir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={commonStyles.actionBar}>
                {!item.lockedByResources ? (
                  <Text style={commonStyles.statusTextYellow}>⏳ {formatDuration(item.time)}</Text>
                ) : (
                  <Text style={commonStyles.statusTextYellow}>⚠️ Recursos insuficientes</Text>
                )}
                <TouchableOpacity
                  style={[
                    commonStyles.buttonPrimary,
                    item.lockedByResources && commonStyles.buttonDisabled,
                  ]}
                  onPress={() => onBuild(item.type)}
                  disabled={item.lockedByResources}
                >
                  <Text style={commonStyles.buttonTextLight}>Construir</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
