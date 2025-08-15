import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { useTerraformModalStore } from "@/src/store/terraformModalStore";
import { commonStyles } from "@/src/styles/commonStyles";
import { getAncientAlienStructuresAlreadyFound } from "@/utils/configUtils";
import { getAncientAlienStructuresFound } from "@/utils/hexUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ModalTerraform() {
  const { t } = useTranslation("common");

  const selectedHex = useTerraformModalStore((s) => s.hex);
  const visible = useTerraformModalStore((s) => s.isVisible);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const close = useTerraformModalStore((s) => s.close);
  const handleTerraform = useGameContextSelector((ctx) => ctx.handleTerraform);
  const updateQuest = useGameContextSelector((ctx) => ctx.updateQuest);
  const setHexAncientStructure = useGameContextSelector((ctx) => ctx.setHexAncientStructure);

  const onTerraform = async () => {
    const currentHexesTerraformed = hexes.filter((hex) => hex.isTerraformed).length;
    const baseLevel = hexes.find((hex) => hex.building?.type === "BASE")?.building?.level;
    const baseUpgradeLevel = hexes.find((hex) => hex.construction?.building === "BASE")
      ?.construction?.targetLevel;
    const effectiveLevel = baseUpgradeLevel ?? baseLevel ?? 0;
    const terraformLimit = effectiveLevel * 10 + 3;
    const maxTerraformReached = currentHexesTerraformed >= terraformLimit;
    if (maxTerraformReached) {
      Toast.show({
        type: "info", // "success" | "info" | "error"
        text1: "Límite de exploración alcanzado. Mejora la base",
        position: "top",
        visibilityTime: 2000,
      });
    } else if (selectedHex) {
      const ancientStructuresAlreadyFound = getAncientAlienStructuresAlreadyFound(playerConfig);
      if (!ancientStructuresAlreadyFound) {
        if (getAncientAlienStructuresFound(currentHexesTerraformed))
          Alert.alert(
            "Terreno misterioso",
            "Este terreno parece distinto. Las primeras inspecciones indican una gran cantidad de humedad en el subsuelo. ¡Quizá sea agua!",
            [
              {
                text: "Aceptar",
                onPress: () => {
                  setHexAncientStructure(selectedHex);
                },
              },
            ],
            { cancelable: false }
          );
      }
      handleTerraform(selectedHex.q, selectedHex.r);
      if (selectedHex.terrain === "WATER") {
        Alert.alert(
          "Terreno misterioso",
          "Este terreno parece distinto. Las primeras inspecciones indican una gran cantidad de humedad en el subsuelo. ¡Quizá sea agua!",
          [
            {
              text: "Aceptar",
              onPress: () => {
                updateQuest({ type: "H2O_SEARCH", completed: true });
              },
            },
          ],
          { cancelable: false }
        );
      }
      close();
    }
  };

  if (!visible || !selectedHex) return null;

  return (
    <Pressable style={styles.overlay} onPress={close}>
      <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
        <ImageBackground
          source={IMAGES.UNTERRAFORMED}
          style={commonStyles.cardPopUp}
          imageStyle={commonStyles.imageCoverPopUp}
        >
          <View style={commonStyles.overlayDark}>
            <View>
              <Text style={commonStyles.titleText}>Terreno sin terraformar</Text>
              <Text style={commonStyles.whiteText}>
                La cantidad máxima de territorios que puedes terraformar va en función del nivel de
                tu base. Terraforma con cuidado.
              </Text>
            </View>

            <View style={commonStyles.actionBar}>
              <Pressable style={commonStyles.cancelButton} onPress={close}>
                <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
              </Pressable>

              <Pressable
                style={commonStyles.buttonPrimary}
                onPress={() => {
                  onTerraform();
                  close();
                }}
              >
                <Text style={commonStyles.buttonTextLight}>{t("terraform")}</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    width: "90%",
    borderRadius: 12,
    overflow: "hidden", // para que la imagen y bordes redondeados funcionen bien
    borderWidth: 1, // grosor mínimo del borde
    borderColor: "#fff", // color blanco
  },
});
