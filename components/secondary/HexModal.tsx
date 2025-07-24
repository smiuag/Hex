import { StoredResources } from "@/src/types/resourceTypes";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { buildingConfig } from "../../src/config/buildingConfig";
import { researchTechnologies } from "../../src/config/researchConfig";
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
    const cardOpacity = canBuild ? 0.2 : 0.4;

    return (
      <ImageBackground
        source={config.imageBackground}
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
        imageStyle={{
          resizeMode: "cover",
          opacity: cardOpacity,
        }}
      >
        <View style={{ padding: 16, backgroundColor: "rgba(0,0,0,0.55)" }}>
          <Text style={[styles.title, { color: "white" }]}>{config.name}</Text>

          <Text style={[styles.description, { color: "#ccc" }]}>
            {config.description}
          </Text>
          <Text style={[styles.subTitle, { color: "#eee" }]}>
            Nivel actual: {building.level}
          </Text>

          {hasProduction && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={[styles.label, { color: "#ddd", lineHeight: 18 }]}>
                Producción (Nv {building.level}):
              </Text>
              <View style={{ marginTop: 1 }}>
                <ResourceDisplay
                  resources={currentProduction}
                  fontSize={14}
                  fontColor="white"
                />
              </View>
            </View>
          )}

          {hasProduction && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={[styles.label, { color: "#ddd", lineHeight: 18 }]}>
                Producción (Nv {nextLevel}):
              </Text>
              <View style={{ marginTop: 1 }}>
                <ResourceDisplay
                  resources={nextProduction}
                  fontSize={14}
                  fontColor="white"
                />
              </View>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.label, { color: "#ddd", lineHeight: 18 }]}>
              Coste:
            </Text>
            <ResourceDisplay resources={cost} fontSize={14} fontColor="white" />
          </View>

          {!canUpgrade && (
            <>
              <Text style={[styles.label, { color: "#ddd" }]}>
                Tiempo de construcción:
              </Text>
              <Text style={{ color: "#fff" }}>{formatDuration(time)}</Text>
            </>
          )}

          <View style={styles.actionContainer}>
            {canUpgrade ? (
              !enoughResources ? (
                <Text style={[styles.lockedByResources]}>
                  ⚠️ Recursos insuficientes
                </Text>
              ) : (
                <Text style={styles.statusText}>⏱️ {formatDuration(time)}</Text>
              )
            ) : (
              <Text style={styles.lockedText}>
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
              style={[styles.buildButton, { opacity: canBuild ? 1 : 0.5 }]}
              onPress={() => canBuild && onBuild(building.type)}
              disabled={!canBuild}
            >
              <Text style={styles.buildButtonText}>Mejorar</Text>
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
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View style={{ padding: 16, backgroundColor: "rgba(0,0,0,0.55)" }}>
          <Text style={[styles.title, { color: "white" }]}>{config.name}</Text>

          <Text style={[styles.description, { color: "#ccc" }]}>
            {config.description}
          </Text>
          {hasProduction && targetLevel > 1 && (
            <>
              <Text style={[styles.subTitle, { color: "#eee" }]}>
                Nivel actual: {targetLevel - 1}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={[styles.label, { color: "#ddd", lineHeight: 18 }]}>
                  Producción (Nv {targetLevel - 1}):
                </Text>
                <View style={{ marginTop: 1 }}>
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
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={[styles.label, { color: "#ddd", lineHeight: 18 }]}>
                Producción (Nv {targetLevel}):
              </Text>
              <View style={{ marginTop: 1 }}>
                <ResourceDisplay
                  resources={nextProduction}
                  fontSize={14}
                  fontColor="white"
                />
              </View>
            </View>
          )}

          <View style={styles.actionContainer}>
            <Text style={styles.statusText}>
              ⏱️ {formatDuration(remainingTime)}
            </Text>

            <Pressable style={styles.cancelButton} onPress={onCancelBuild}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalWrapper}
          onPress={(e) => e.stopPropagation()}
        >
          {construction ? renderConstructionView() : renderUpgradeView()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    maxHeight: "80%",
    width: 350,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",

    // 👇 Contorno sutil
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",

    // 👇 Sombra (opcional para más profundidad)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4, // Android
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 16,
    alignItems: "flex-start",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    alignSelf: "center",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  level: {
    fontSize: 18,
    fontWeight: "normal",
    color: "#777",
  },
  box: {
    width: "100%",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    gap: 6,
    alignSelf: "stretch",
    flexShrink: 1,
    alignItems: "flex-start",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#444",
    fontSize: 14,
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    minWidth: "100%",
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  lockedText: {
    color: "#b91c1c",
    verticalAlign: "middle",
    fontSize: 14,
  },
  lockedByResources: {
    color: "#facc15",
    verticalAlign: "middle",
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "100%",
  },

  statusText: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 13,
  },

  buildButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  cancelButton: {
    backgroundColor: "#f87171",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  buildButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
