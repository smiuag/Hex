// PlayerSetup.tsx
import i18n, { Lang } from "@/i18n";
import { useGameContextSelector } from "@/src/context/GameContext";
import React, { useEffect, useRef, useState } from "react";

import { getCfg, normalizeLang, validateName } from "@/utils/generalUtils";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PlayerSetup() {
  const { t } = useTranslation();
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const handleUpdateConfig = useGameContextSelector((ctx) => ctx.handleUpdateConfig);

  // Estado local
  const [playerName, setPlayerName] = useState("");
  const [colonyName, setColonyName] = useState("");
  const [lang, setLang] = useState<Lang>(normalizeLang(i18n.language));
  const router = useRouter();

  // Rellenar datos iniciales desde config (solo una vez)
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current) return;

    const initialPlayer = getCfg(playerConfig, "PLAYER_NAME");
    const initialColony = getCfg(playerConfig, "PLANET_NAME");
    const savedLang = normalizeLang(getCfg(playerConfig, "PLAYER_LANGUAGE"));

    setPlayerName(initialPlayer);
    setColonyName(initialColony);
    setLang(savedLang);

    // aplica idioma guardado a i18n si difiere
    const current = normalizeLang(i18n.language);
    if (savedLang !== current) {
      i18n.changeLanguage(savedLang);
    }

    prefilledRef.current = true;
  }, [playerConfig]);

  // Cambiar idioma (aplica global + guarda en config)
  const changeLanguage = async (l: Lang) => {
    setLang(l);
    await i18n.changeLanguage(l);
    handleUpdateConfig({ key: "PLAYER_LANGUAGE", value: l });
  };

  const openAchievements = () => {
    router.push("/(tabs)/menu/achievements"); // ajusta el path si tu ruta es otra
  };

  const playerErrors = validateName(
    playerName,
    t as unknown as (key: string, options?: object) => string
  );
  const colonyErrors = validateName(
    colonyName,
    t as unknown as (key: string, options?: object) => string
  );
  const canSave =
    playerErrors.length === 0 && colonyErrors.length === 0 && !!playerName && !!colonyName;

  // Guardar en config
  const handleSave = () => {
    if (!canSave) return;
    handleUpdateConfig({ key: "PLAYER_NAME", value: playerName.trim() });
    handleUpdateConfig({ key: "PLANET_NAME", value: colonyName.trim() });
    handleUpdateConfig({ key: "PLAYER_LANGUAGE", value: lang });

    Alert.alert("OK", t("Saved", "Guardado"));
  };

  // Finalizar partida (ajusta si tienes otro flujo)
  const handleEndGame = () => {
    Alert.alert(t("setup.endGameConfirmTitle"), t("setup.endGameConfirmMsg"), [
      { text: t("setup.cancel"), style: "cancel" },
      {
        text: t("setup.confirm"),
        style: "destructive",
        onPress: () => {
          handleUpdateConfig({ key: "GAME_STARTED", value: "false" });
          router.replace("/(tabs)/menu");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t("setup.title")}</Text>

          {/* Idioma */}
          <Text style={styles.label}>{t("setup.language")}</Text>
          <View style={styles.segment}>
            <SegmentButton
              label={t("setup.spanish")}
              selected={lang === "es"}
              onPress={() => changeLanguage("es")}
            />
            <SegmentButton
              label={t("setup.english")}
              selected={lang === "en"}
              onPress={() => changeLanguage("en")}
            />
          </View>

          {/* Nombre del jugador */}
          <Text style={styles.label}>{t("setup.playerName")}</Text>
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="..."
            maxLength={24}
            style={[styles.input, playerErrors.length ? styles.inputError : undefined]}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {playerErrors.map((e, i) => (
            <Text key={i} style={styles.errorText}>
              {e}
            </Text>
          ))}

          {/* Nombre de la colonia */}
          <Text style={styles.label}>{t("setup.colonyName")}</Text>
          <TextInput
            value={colonyName}
            onChangeText={setColonyName}
            placeholder="..."
            maxLength={24}
            style={[styles.input, colonyErrors.length ? styles.inputError : undefined]}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {colonyErrors.map((e, i) => (
            <Text key={i} style={styles.errorText}>
              {e}
            </Text>
          ))}

          {/* Botones */}
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.btn,
                !canSave ? styles.btnDisabled : styles.btnPrimary,
                pressed && canSave && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnText}>{t("setup.save")}</Text>
            </Pressable>
            <Pressable
              onPress={handleEndGame}
              style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnText}>{t("endGame")}</Text>
            </Pressable>

            <Pressable
              onPress={openAchievements}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSecondary,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnText}>{t("Achievements", { defaultValue: "Logros" })}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentBtn,
        selected && styles.segmentBtnActive,
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0c" },
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8 },
  label: { color: "#c9c9cf", fontSize: 14, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#1a1a1f",
    borderWidth: 1,
    borderColor: "#2a2a31",
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#ff6262" },
  errorText: { color: "#ff8a8a", fontSize: 12, marginTop: 4 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#121216",
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: { backgroundColor: "#2a2a31" },
  segmentText: { color: "#c9c9cf", fontSize: 14, fontWeight: "600" },
  segmentTextActive: { color: "white" },
  buttonsRow: {
    flexDirection: "column", // <-- antes: "row"
    gap: 12,
    marginTop: 24,
  },

  btn: {
    // flex: 1,                  // <-- quita esto
    width: "100%", // <-- ocupa todo el ancho disponible
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#4b6bff" },
  btnDanger: { backgroundColor: "#ff4b4b" },
  btnDisabled: { backgroundColor: "#3a3a43" },
  btnPressed: { opacity: 0.9 },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    backgroundColor: "#2a2a31",
  },
});
