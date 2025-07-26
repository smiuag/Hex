import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { researchTechnologies } from "../../src/config/researchConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { BuildingType } from "../../src/types/buildingTypes";
import { Resources } from "../../src/types/resourceTypes";
import {
  getBuildTime,
  isAtMaxCount,
  isUnlocked,
} from "../../utils/buildingUtils";
import { formatDuration } from "../../utils/generalUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function ConstructionComponent() {
  const { q, r } = useLocalSearchParams();
  const { research, resources, hexes, handleBuild } = useGameContext();
  const router = useRouter();

  const onBuild = async (type: BuildingType) => {
    const qNum = parseInt(q as string, 10);
    const rNum = parseInt(r as string, 10);
    await handleBuild(qNum, rNum, type);
    router.replace("/(tabs)/planet");
  };

  const handleCancel = () => {
    router.replace("/(tabs)/planet");
  };

  const buildings = Object.entries(buildingConfig)
    .map(([type, config]) => {
      const buildingType = type as BuildingType;
      const cost: Partial<Resources> = config.baseCost;
      const time = getBuildTime(buildingType, 1);
      const lockedByMax = isAtMaxCount(buildingType, hexes);
      const unlockedByResearch = isUnlocked(buildingType, 1, research);
      const available = unlockedByResearch && !lockedByMax;
      const lockedByResources = !hasEnoughResources(resources, cost);

      return {
        type: buildingType,
        name: config.name,
        image: config.imageBackground,
        cost,
        time,
        available,
        lockedByMax,
        unlockedByResearch,
        description: config.description,
        requirements: config.requiredResearch,
        lockedByResources,
      };
    })
    .sort((a, b) => {
      // Prioridad: disponibles (0), luego bloqueados por investigación (1), luego al máximo (2)
      const getPriority = (building: typeof a) => {
        if (building.lockedByMax) return 3;
        if (!building.unlockedByResearch) return 2;
        if (building.lockedByResources) return 1;
        if (building.available) return 0;
        return 3; // fallback
      };

      return getPriority(a) - getPriority(b);
    });

  return (
    <View style={{ flex: 1 }}>
      {/* Botón flotante de cerrar */}
      <TouchableOpacity
        onPress={handleCancel}
        style={commonStyles.closeXButton}
      >
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>

      <FlatList
        data={buildings}
        keyExtractor={(item) => item.type}
        contentContainerStyle={commonStyles.flatList}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={handleCancel}
          >
            <Text style={commonStyles.closeText}>Volver</Text>
          </TouchableOpacity>
        )}
        renderItem={({ item }) => (
          <View style={commonStyles.cardContainer}>
            <ImageBackground
              source={item.image}
              style={[commonStyles.card]}
              imageStyle={[
                commonStyles.imageCover,
                !item.available && commonStyles.imageUnavailable,
              ]}
            >
              <View style={commonStyles.overlayDark}>
                <View>
                  <Text style={commonStyles.titleText}>{item.name}</Text>

                  <Text style={commonStyles.subtitleText}>
                    {item.description}
                  </Text>
                </View>
                <View>
                  {!item.lockedByMax && (
                    <ResourceDisplay resources={item.cost} fontSize={13} />
                  )}

                  {item.lockedByMax ? (
                    <View>
                      <Text style={commonStyles.errorTextRed}>
                        🔒 Límite alcanzado
                      </Text>
                    </View>
                  ) : !item.unlockedByResearch ? (
                    <View>
                      {Object.values(
                        item.requirements.reduce((acc, req) => {
                          const existing = acc[req.researchType];
                          if (
                            !existing ||
                            req.researchLevelRequired <
                              existing.researchLevelRequired
                          ) {
                            acc[req.researchType] = req;
                          }
                          return acc;
                        }, {} as Record<string, (typeof item.requirements)[0]>)
                      ).map((r, i) => (
                        <Text key={i} style={[commonStyles.errorTextRed]}>
                          🔒{" "}
                          {researchTechnologies[r.researchType]?.name ??
                            r.researchType}{" "}
                          Nv {r.researchLevelRequired}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <View style={commonStyles.actionBar}>
                      {!item.lockedByResources ? (
                        <Text style={commonStyles.statusTextYellow}>
                          ⏱️ {formatDuration(item.time)}
                        </Text>
                      ) : (
                        <Text style={commonStyles.statusTextYellow}>
                          ⚠️ Recursos insuficientes
                        </Text>
                      )}

                      <TouchableOpacity
                        style={[
                          commonStyles.buttonPrimary,
                          item.lockedByResources && commonStyles.buttonDisabled,
                        ]}
                        onPress={() => onBuild(item.type)}
                        disabled={item.lockedByResources}
                      >
                        <Text style={commonStyles.buttonTextLight}>
                          Construir
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </View>
        )}
      />
    </View>
  );
}
