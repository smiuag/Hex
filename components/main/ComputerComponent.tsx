import { questConfig } from "@/src/config/questConfig";
import { useGameContext } from "@/src/context/GameContext";
import { QuestType } from "@/src/types/questType";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { QuestHeader } from "../auxiliar/QuestHeader";

export default function ComputerComponent() {
  const { type } = useLocalSearchParams();
  if (!type || typeof type !== "string") return null;
  const [allLines, setAllLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { markQuestsAsViewed } = useGameContext();

  useEffect(() => {
    setAllLines([]);
    setCurrentLine("");
    setMessageIndex(0);
    setCharIndex(0);
    setIsTyping(false);
    setShowConfirm(false);
  }, [type]);

  const promptBlink = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  const onConfirm = async () => {
    await markQuestsAsViewed(type as QuestType);
    router.replace("/quests");
  };

  const { t } = useTranslation("common");
  const { t: tQuests } = useTranslation("quests");

  const messages = tQuests(`${type}.descriptions`, { returnObjects: true }) as string[];

  var contextType = questConfig[type as QuestType].contextType;

  // Animación de parpadeo del prompt
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(promptBlink, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(promptBlink, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Typewriter automático
  useEffect(() => {
    if (messageIndex >= messages.length) {
      setShowConfirm(true);
      return;
    }

    const currentMessage = messages[messageIndex];

    if (charIndex < currentMessage.length) {
      setIsTyping(true);
      const timeout = setTimeout(() => {
        setCurrentLine(currentMessage.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 10);
      return () => clearTimeout(timeout);
    } else if (!isTyping) {
      const timeout = setTimeout(() => {
        setAllLines((prev) => [...prev, currentLine]);
        setMessageIndex((prev) => prev + 1);
        setCharIndex(0);
        setCurrentLine("");
      }, 1);
      return () => clearTimeout(timeout);
    }
    setIsTyping(false);
  }, [charIndex, messageIndex, isTyping]);

  const handlePress = () => {
    if (showConfirm) {
      onConfirm();
      return;
    }

    const currentMessage = messages[messageIndex];
    if (isTyping) {
      setCurrentLine(currentMessage);
      setCharIndex(currentMessage.length);
      setIsTyping(false);
    }
  };

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

          <Animated.Text style={[styles.prompt, { opacity: promptBlink }]}>{"C:\\>"}</Animated.Text>
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
