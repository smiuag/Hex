import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BuildingType, Hex } from "../data/tipos";
import { getBuildTime } from "../utils/helpers";

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
      setRemainingTime(Math.max(0, totalBuildTime - elapsed));
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
          <Text style={styles.label}>Construcción en curso:</Text>
          <Text>Edificio: {construction.building}</Text>
          <Text>Nivel: {construction.targetLevel}</Text>
          <Text>
            Tiempo restante: {Math.ceil(remainingTime / 1000)} segundos
          </Text>
          <Pressable style={styles.button} onPress={onCancelBuild}>
            <Text style={styles.buttonText}>Cancelar construcción</Text>
          </Pressable>
        </>
      );
    }

    if (building && !construction) {
      return (
        <>
          <Text style={styles.label}>Edificio construido:</Text>
          <Text>Tipo: {building.type}</Text>
          <Text>Nivel actual: {building.level}</Text>
          <Pressable
            style={styles.button}
            onPress={() => onBuild(building.type)}
          >
            <Text style={styles.buttonText}>
              Mejorar a nivel {building.level + 1}
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Terreno vacío</Text>
        <Text>Tipo: {terrain}</Text>
        <Text style={styles.label}>Construir:</Text>

        <View style={styles.buildButtons}>
          <Pressable style={styles.button} onPress={() => onBuild("factory")}>
            <Text style={styles.buttonText}>Fábrica</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => onBuild("lab")}>
            <Text style={styles.buttonText}>Laboratorio</Text>
          </Pressable>
        </View>
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
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {renderContent()}
          <Pressable
            onPress={onClose}
            style={[styles.button, { backgroundColor: "#aaa" }]}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    width: 300,
    gap: 12,
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  buildButtons: {
    flexDirection: "column",
    gap: 8,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
