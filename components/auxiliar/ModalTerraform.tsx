import { IMAGES } from "@/src/constants/images";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Modal, Pressable, Text, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { hexStyles } from "../../src/styles/hexStyles";
import { Hex } from "../../src/types/hexTypes";

type Props = {
  visible: boolean;
  onClose: () => void;
  data: Hex | null;
  onTerraform: () => void;
};

export default function ModalTerraform({ visible, onClose, data, onTerraform }: Props) {
  const { t } = useTranslation("common");

  if (!data) return null;

  const renderTerraformView = () => {
    return (
      <ImageBackground
        source={IMAGES.UNTERRAFORMED}
        style={commonStyles.cardPopUp}
        imageStyle={commonStyles.imageCoverPopUp}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <View>
              <Text style={commonStyles.titleText}>Terreno sin terraformar</Text>
            </View>
            <View>
              <Text style={commonStyles.whiteText}>
                La cantidad máxima de territorios que puedes terraformar va en función del nivel de
                tu base. Terraforma con cuidado.
              </Text>
            </View>
          </View>

          <View style={commonStyles.actionBar}>
            <Pressable style={[commonStyles.cancelButton]} onPress={() => onClose()}>
              <Text style={commonStyles.cancelButtonText}>{t("cancel")}</Text>
            </Pressable>

            <Pressable style={[commonStyles.buttonPrimary]} onPress={() => onTerraform()}>
              <Text style={commonStyles.buttonTextLight}>{t("terraform")}</Text>
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
          {renderTerraformView()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
