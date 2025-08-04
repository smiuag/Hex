import { HapticTab } from "@/components/auxiliar/HapticTab";
import { Tabs, useRouter } from "expo-router";
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
import { useGameContextSelector } from "../../src/context/GameContext";
import { questIconView, tabStyles } from "../../src/styles/tabsStyles";
import { gameStarted, hasAntennaBuilt, hasHangarBuilt } from "../../utils/configUtils";

export default function TabLayout() {
  const playerQuests = useGameContextSelector((ctx) => ctx.playerQuests);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const partidaIniciada = gameStarted(playerConfig);
  const router = useRouter();

  console.log("Montado TabLayout");
  const hasHangar = hasHangarBuilt(playerConfig);
  const hasAntenna = hasAntennaBuilt(playerConfig);
  console.log(playerQuests);
  const hasCompletedQuest = playerQuests.some((q) => q.completed && !q.rewardClaimed);
  const newQuest = playerQuests.find((q) => q.available && !q.viewed);
  const hasNewQuest = !!newQuest;
  const newQuestId = newQuest?.type as string;

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
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Evita la navegación automática
            router.replace("/(tabs)/planet"); // Siempre redirige a index
          },
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
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(tabs)/galaxy");
          },
        }}
      />

      <Tabs.Screen
        name="quests"
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
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (hasNewQuest && newQuestId) {
              router.replace(`/(tabs)/quests/computer?type=${newQuestId}`);
            } else {
              router.replace("/(tabs)/quests");
            }
          },
        }}
      />
    </Tabs>
  );
}
