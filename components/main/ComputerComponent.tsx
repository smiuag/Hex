import { questConfig } from "@/src/config/questConfig";
import { useGameContextSelector } from "@/src/context/GameContext";
import { QuestType } from "@/src/types/questType";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { QuestHeader } from "../auxiliar/QuestHeader";

export default function ComputerComponent() {
  const { type } = useLocalSearchParams();

  const questType = type as QuestType;

  // estado
  const [allLines, setAllLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // refs para limpieza
  const scrollRef = useRef<ScrollView>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptBlink = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  const playerQuests = useGameContextSelector((ctx) => ctx.playerQuests);
  const updateQuest = useGameContextSelector((ctx) => ctx.updateQuest);

  const { t } = useTranslation("common");
  const { t: tQuests, i18n } = useTranslation("quests");

  // 👇 Memoiza los mensajes; se recalcula si cambia tipo o idioma
  const messages = useMemo(() => {
    const m = tQuests(`${questType}.descriptions`, { returnObjects: true }) as unknown;
    return Array.isArray(m) ? (m as string[]) : [];
    // depende de idioma porque i18n actualiza t() sin cambiar la ref de la función
  }, [tQuests, questType, i18n.language]);

  const contextType = questConfig[questType].contextType;

  // ✅ Reset sólido cuando cambian los mensajes (por tipo o idioma)
  useEffect(() => {
    // limpia timers pendientes
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setAllLines([]);
    setCurrentLine("");
    setMessageIndex(0);
    setCharIndex(0);
    setIsTyping(false);
    setShowConfirm(false);
  }, [messages]);

  // ✨ Animación del prompt (con cleanup)
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(promptBlink, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(promptBlink, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => {
      // detener la animación evita callbacks en medio del desmontaje
      anim.stop();
    };
  }, [promptBlink]);

  // ⌨️ Typewriter (con cleanup y deps correctas)
  useEffect(() => {
    // limpia cualquier timer previo
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (messageIndex >= messages.length) {
      setShowConfirm(true);
      setIsTyping(false);
      return;
    }

    const msg = messages[messageIndex];

    // marcador especial para limpiar pantalla
    if (msg === "<>") {
      setIsTyping(false);
      return;
    }

    if (charIndex < msg.length) {
      setIsTyping(true);
      typingTimerRef.current = setTimeout(() => {
        setCurrentLine(msg.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1); // usa functional update
      }, 10);
    } else {
      // línea completada -> pasa a la siguiente
      typingTimerRef.current = setTimeout(() => {
        setAllLines((prev) => [...prev, msg]);
        setMessageIndex((prev) => prev + 1);
        setCharIndex(0);
        setCurrentLine("");
        setIsTyping(false);
      }, 1);
    }

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [messages, messageIndex, charIndex]);

  if (!type || typeof type !== "string") return null;

  const onConfirm = useCallback(async () => {
    await updateQuest({
      type: questType,
      viewed: true,
      completed: questType === "START" ? true : undefined,
      rewardClaimed: playerQuests.some((q) => q.type === questType && q.rewardClaimed)
        ? true
        : false,
    });
    router.replace(`/(tabs)/quests?reload=${questType}`);
  }, [updateQuest, playerQuests, questType, router]);

  const handlePress = useCallback(() => {
    if (showConfirm) {
      onConfirm();
      return;
    }

    if (messageIndex >= messages.length) return;

    const msg = messages[messageIndex];

    if (msg === "<>") {
      // limpia y avanza
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setAllLines([]);
      setMessageIndex((prev) => prev + 1);
      setCharIndex(0);
      setCurrentLine("");
      setIsTyping(false);
      return;
    }

    if (isTyping) {
      // completar instantáneamente la línea
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setCurrentLine(msg);
      setCharIndex(msg.length);
      setIsTyping(false);
    }
  }, [showConfirm, onConfirm, messageIndex, messages, isTyping]);

  // 🔚 Limpieza global al desmontar
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <QuestHeader type={contextType} />
      <View style={styles.terminalContainer}>
        <View style={styles.terminal}>
          <ScrollView
            style={styles.scrollArea}
            ref={scrollRef}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {allLines.map((line, index) => (
              <Text key={index} style={styles.text}>
                {line}
              </Text>
            ))}
            {messageIndex < messages.length && (
              <Text style={styles.text}>
                {currentLine}
                {isTyping && <Text style={styles.cursor}>█</Text>}
              </Text>
            )}
          </ScrollView>

          {(showConfirm || messages[messageIndex] === "<>") && (
            <Animated.Text style={[styles.prompt, { opacity: promptBlink }]}>
              {"C:\\>"}
            </Animated.Text>
          )}
        </View>

        {showConfirm && (
          <View style={styles.confirmButton}>
            <Button title={t("confirm")} onPress={onConfirm} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    color: "#00ffe0",
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "monospace",
  },
  terminalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  text: {
    fontFamily: "monospace",
    fontSize: 16,
    color: "#00ffe0",
    marginBottom: 4,
  },
  cursor: {
    color: "#00ffe0",
  },
  confirmButton: {
    marginTop: 15,
    alignItems: "center",
  },
  terminal: {
    backgroundColor: "#001010",
    borderWidth: 1,
    borderColor: "#00ffe0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 8,
    flex: 1,
    justifyContent: "space-between",
  },

  scrollArea: {
    flexGrow: 1,
  },

  prompt: {
    fontFamily: "monospace",
    fontSize: 16,
    color: "#00ffe0",
    marginTop: 8,
  },
});
