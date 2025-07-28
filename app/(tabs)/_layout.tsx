import { HapticTab } from "@/components/auxiliar/HapticTab";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import {
  GalaxyIcon,
  MenuIcon,
  PlanetIcon,
  QuestIcon,
  ResearchIcon,
  ShipIcon,
} from "../../components/auxiliar/MenuIcons";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { questIconView, tabStyles } from "../../src/styles/tabsStyles";
import { gameStarted } from "../../utils/configUtils";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";

export default function TabLayout() {
  const { playerQuests, hexes, research, shipBuildQueue, playerConfig } = useGameContext();
  const partidaIniciada = gameStarted(playerConfig);

  const hasHangar = hexes.length > 0 && hexes.some((h) => h.building?.type == "HANGAR");
  const hasAntenna = hexes.length > 0 && hexes.some((h) => h.building?.type == "ANTENNA");
  const completedQuestTypes = playerQuests.filter((q) => q.completed).map((q) => q.type);

  const hasNewQuest = Object.values(questConfig).some((quest) => {
    const isCompleted = completedQuestTypes.includes(quest.type);
    const isAvailable = shouldShowQuest(quest.type, completedQuestTypes);
    const isViewed = playerQuests.some((q) => q.type === quest.type && q.viewed);
    return !isCompleted && !isViewed && isAvailable;
  });

  const hasCompletedQuest = Object.values(questConfig).some((quest) => {
    const pq = playerQuests.find((q) => q.type === quest.type);
    const isAvailable = shouldShowQuest(quest.type, completedQuestTypes);
    const isCompleted = canCompleteQuest(quest.type, hexes, research, shipBuildQueue);

    return pq && !pq.completed && isAvailable && isCompleted;
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarButton: HapticTab,
        tabBarStyle: tabStyles.tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color, size }) => <MenuIcon color={color} size={size} />,
          tabBarLabel: "Menu",
        }}
      />

      <Tabs.Screen
        name="planet"
        options={{
          tabBarIcon: ({ color, size }) => <PlanetIcon color={color} size={size} />,
          tabBarLabel: "Planeta",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : tabStyles.hidden,
        }}
      />

      <Tabs.Screen
        name="research"
        options={{
          tabBarIcon: ({ color, size }) => <ResearchIcon color={color} size={size} />,
          tabBarLabel: "Investigación",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : tabStyles.hidden,
        }}
      />
      <Tabs.Screen
        name="ship"
        options={{
          tabBarIcon: ({ color, size }) => <ShipIcon color={color} size={size} />,
          tabBarLabel: "Naves",
          tabBarButton: hasHangar && partidaIniciada ? undefined : () => null,
          tabBarItemStyle: hasHangar && partidaIniciada ? {} : tabStyles.hidden,
        }}
      />

      <Tabs.Screen
        name="galaxy"
        options={{
          tabBarIcon: ({ color, size }) => <GalaxyIcon color={color} size={size} />,
          tabBarLabel: "Galaxia",
          tabBarButton: hasAntenna && partidaIniciada ? undefined : () => null,
          tabBarItemStyle: hasAntenna && partidaIniciada ? {} : tabStyles.hidden,
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          tabBarIcon: ({ color, size }) => {
            return (
              <View>
                <QuestIcon color={color} size={size} />
                {(hasCompletedQuest || hasNewQuest) && (
                  <View style={questIconView(hasCompletedQuest ? "green" : "red")}>
                    <Text style={tabStyles.questIconText}>!</Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarLabel: "Misiones",
          tabBarButton: partidaIniciada ? undefined : () => null,
          tabBarItemStyle: partidaIniciada ? {} : tabStyles.hidden,
        }}
      />
    </Tabs>
  );
}
