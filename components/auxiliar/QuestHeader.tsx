import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, Text, View } from "react-native";
import { ContextType } from "../../src/types/questType";

type Props = {
  type: ContextType;
};

const iconMap: Record<ContextType, React.ReactNode> = {
  GENERAL: <Ionicons name="planet" size={32} color="#00ffe0" />,
  RESEARCH: <FontAwesome5 name="microscope" size={28} color="#00d0ff" />,
  BUILD: <Ionicons name="build" size={30} color="#ffaa00" />,
  FLEET: <MaterialCommunityIcons name="rocket-launch" size={30} color="#00ff90" />,
  ATTACK: <Ionicons name="flame" size={30} color="#ff3b30" />,
  DEFENSE: <MaterialCommunityIcons name="shield-check" size={30} color="#66ccff" />,
  SYSTEM: <MaterialCommunityIcons name="orbit-variant" size={30} color="#ffd700" />,
};

export const QuestHeader: React.FC<Props> = ({ type }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation("common"); // Asegúrate que sea el namespace correcto

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const iconOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={[styles.header, { alignItems: "center" }]}>
      <Animated.View style={{ opacity: iconOpacity }}>{iconMap[type]}</Animated.View>
      <Text style={styles.headerText}>{t("MainTerminal")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
