import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BuildingType } from "../../src/types/buildingTypes";
import { Hex } from "../../src/types/hexTypes";
import { ResourceDisplay } from "./ResourceDisplay";

import {
  formatDuration,
  getAvailableBuildings,
  getBuildCost,
  getBuildTime,
} from "../../utils/buildingUtils";

type Props = {
  visible: boolean;
  onClose: () => void;
  data: Hex | null;
  onBuild: (type: BuildingType) => void;
  onCancelBuild: () => void;
};

export default function HexModal({
  visible,
  onClose,
  data,
  onBuild,
  onCancelBuild,
}: Props) {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!data?.construction) return;

    const { building, startedAt, targetLevel } = data.construction;
    const totalBuildTime = getBuildTime(building, targetLevel);

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
  }, [data?.construction]);

  if (!data) return null;

  const { terrain, building, construction } = data;

  const renderContent = () => {
    if (construction && remainingTime !== null) {
      return (
        <>
          <Text style={styles.title}>
            {construction.building.toUpperCase()}{" "}
            <Text style={styles.level}>Nv: {construction.targetLevel}</Text>
          </Text>

          <Pressable
            style={styles.box}
            android_disableSound={true}
            onPress={() => {}}
          >
            <Text style={styles.subTitle}>Construcción en curso</Text>
            <Text style={styles.timeText}>
              Tiempo restante: {formatDuration(remainingTime)}
            </Text>

            <Pressable
              style={[styles.button, { backgroundColor: "#e53935" }]}
              onPress={onCancelBuild}
            >
              <Text style={styles.upgradeButtonText}>
                Cancelar construcción
              </Text>
            </Pressable>
          </Pressable>
        </>
      );
    }

    if (building && !construction) {
      const cost = getBuildCost(building.type, building.level + 1);
      const time = getBuildTime(building.type, building.level + 1);

      return (
        <>
          <Text style={styles.title}>
            {building.type.toUpperCase()}{" "}
            <Text style={styles.level}>Nv: {building.level}</Text>
          </Text>

          <Pressable
            style={styles.box}
            android_disableSound={true}
            onPress={() => {}}
          >
            <ResourceDisplay resources={cost} fontSize={16} fontColor="#333" />

            <Pressable
              style={styles.button}
              onPress={() => onBuild(building.type)}
            >
              <Text style={styles.upgradeButtonText}>
                Mejorar a nivel {building.level + 1} ({formatDuration(time)})
              </Text>
            </Pressable>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Pressable
          style={styles.buttons}
          android_disableSound={true}
          onPress={() => {}}
        >
          {getAvailableBuildings().map((building) => {
            return (
              <View key={building.type} style={styles.box}>
                <ResourceDisplay
                  resources={building.baseCost}
                  fontSize={16}
                  fontColor="#333"
                />
                <Pressable
                  style={styles.button}
                  onPress={() => onBuild(building.type)}
                >
                  <Text style={styles.upgradeButtonText}>
                    Construir {building.name} (
                    {formatDuration(building.baseBuildTime)})
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </Pressable>
      </>
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            <Pressable onPress={() => {}}>{renderContent()}</Pressable>
          </ScrollView>
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
  },

  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    height: 350,
  },
  modal: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
  },
  buttons: {
    width: 300,
    flexDirection: "column",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
    color: "#444",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  level: {
    fontSize: 18,
    fontWeight: "normal",
    color: "#777",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  box: {
    width: "100%",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    gap: 6,
    alignSelf: "stretch",
    flexShrink: 1,
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 250,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
