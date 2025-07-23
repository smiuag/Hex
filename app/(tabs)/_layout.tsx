import { HapticTab } from "@/components/secondary/HapticTab";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";
import {
  FleetIcon,
  GalaxyIcon,
  MenuIcon,
  PlanetIcon,
  QuestIcon,
  ResearchIcon,
} from "../../components/secondary/MenuIcons";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";

export default function TabLayout() {
  const { playerQuests, hexes, research } = useGameContext();
  const partidaIniciada = hexes.length > 0;

  const completedQuestTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type);

  const hasNewQuest = Object.values(questConfig).some((quest) => {
    const isCompleted = completedQuestTypes.includes(quest.type);
    const isAvailable = shouldShowQuest(quest.type, completedQuestTypes);
    const isViewed = playerQuests.some(
      (q) => q.type === quest.type && q.viewed
    );
    return !isCompleted && !isViewed && isAvailable;
  });

  const hasCompletedQuest = Object.values(questConfig).some((quest) => {
    const pq = playerQuests.find((q) => q.type === quest.type);
    const isAvailable = shouldShowQuest(quest.type, completedQuestTypes);
    const isCompleted = canCompleteQuest(quest.type, hexes, research);

    return pq && !pq.completed && isAvailable && isCompleted;
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MenuIcon color={color} size={size} />
          ),
          tabBarLabel: "Menu",
        }}
      />

      <Tabs.Screen
        name="planet"
        options={{
          tabBarIcon: ({ color, size }) => (
            <PlanetIcon color={color} size={size} />
          ),
          tabBarLabel: "Planeta",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : { display: "none" },
        }}
      />

      <Tabs.Screen
        name="research"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ResearchIcon color={color} size={size} />
          ),
          tabBarLabel: "Investigación",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : { display: "none" },
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FleetIcon color={color} size={size} />
          ),
          tabBarLabel: "Naves",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : { display: "none" },
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          tabBarIcon: ({ color, size }) => {
            let showDot = false;
            let dotColor = "red";

            if (hasCompletedQuest) {
              showDot = true;
              dotColor = "green";
            } else if (hasNewQuest) {
              showDot = true;
              dotColor = "red";
            }

            return (
              <View>
                <QuestIcon color={color} size={size} />
                {showDot && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: dotColor,
                      borderRadius: 10,
                      width: 16,
                      height: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      !
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarLabel: "Misiones",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : { display: "none" },
        }}
      />

      <Tabs.Screen
        name="galaxy"
        options={{
          tabBarIcon: ({ color, size }) => (
            <GalaxyIcon color={color} size={size} />
          ),
          tabBarLabel: "Galaxia",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : { display: "none" },
        }}
      />
    </Tabs>
  );
}
