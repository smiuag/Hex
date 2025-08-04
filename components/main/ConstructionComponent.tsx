import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Resources } from "../../src/types/resourceTypes";
import { getBuildTime, getUnmetRequirements, isAtMaxCount } from "../../utils/buildingUtils";
import { ConstructionCard } from "../cards/ConstructionCard";

interface BuildingItem {
  type: BuildingType;
  name: string;
  description: string;
  image: any;
  cost: Partial<Resources>;
  time: number;
  available: boolean;
  lockedByMax: boolean;
  unmetRequirements: any[];
  requirements: any[];
  lockedByResources: boolean;
}

export default function ConstructionComponent() {
  const { terrain, q, r } = useLocalSearchParams<{ terrain?: string; q?: string; r?: string }>();
  const research = useGameContextSelector((ctx) => ctx.research);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const router = useRouter();
  const { t } = useTranslation("common");
  const { t: tBuilding } = useTranslation("buildings");
  console.log("Montado ConstructionComponent");

  const isFocused = useIsFocused();
  if (!isFocused) return null;

  const onBuild = async (type: BuildingType) => {
    const qNum = parseInt(q as string, 10);
    const rNum = parseInt(r as string, 10);
    await handleBuild(qNum, rNum, type);
    router.replace("/(tabs)/planet");
  };

  const handleCancel = () => {
    router.replace("/(tabs)/planet");
  };

  const isWater = terrain === "water";

  const buildings: BuildingItem[] = Object.entries(buildingConfig)
    .filter(([type]) => {
      const buildingType = type as BuildingType;
      if (isWater) return buildingType === "WATEREXTRACTOR";
      return buildingType !== "WATEREXTRACTOR";
    })
    .map(([type, config]) => {
      const buildingType = type as BuildingType;
      const cost = config.baseCost;
      const time = getBuildTime(buildingType, 1);
      const lockedByMax = isAtMaxCount(buildingType, hexes);
      const unmetRequirements = getUnmetRequirements(config.requiredResearch, research, 1);
      const available = unmetRequirements.length === 0 && !lockedByMax;
      const lockedByResources = !enoughResources(cost);

      return {
        type: buildingType,
        name: tBuilding(`buildingName.${buildingType}`),
        description: tBuilding(`buildingDescription.${buildingType}`),
        image: config.imageBackground,
        cost,
        time,
        available,
        lockedByMax,
        unmetRequirements,
        requirements: config.requiredResearch,
        lockedByResources,
      };
    })
    .sort((a, b) => {
      const getPriority = (building: BuildingItem) => {
        if (building.lockedByMax) return 3;
        if (building.unmetRequirements.length > 0) return 2;
        if (building.lockedByResources) return 1;
        if (building.available) return 0;
        return 3;
      };

      return getPriority(a) - getPriority(b);
    });

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={handleCancel} style={commonStyles.closeXButton}>
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>

      <FlatList
        data={buildings}
        keyExtractor={(item) => item.type}
        contentContainerStyle={commonStyles.flatList}
        ListFooterComponent={() => (
          <TouchableOpacity style={commonStyles.backButton} onPress={handleCancel}>
            <Text style={commonStyles.closeText}>{t("back")}</Text>
          </TouchableOpacity>
        )}
        renderItem={({ item }) =>
          item.lockedByMax ? (
            <View style={commonStyles.cardContainer}>
              <ImageBackground
                source={item.image}
                style={[commonStyles.card]}
                imageStyle={[commonStyles.imageCover, commonStyles.imageUnavailable]}
              >
                <View style={commonStyles.overlayDark}>
                  <Text style={commonStyles.titleText}>{item.name}</Text>
                  <Text style={commonStyles.subtitleText}>{item.description}</Text>
                  <Text style={commonStyles.errorTextRed}>🔒 Límite alcanzado</Text>
                </View>
              </ImageBackground>
            </View>
          ) : (
            <ConstructionCard item={item} onBuild={onBuild} research={research} />
          )
        }
      />
    </View>
  );
}
