import { HapticTab } from "@/components/secondary/HapticTab";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import {
  FleetIcon,
  GalaxyIcon,
  MenuIcon,
  PlanetIcon,
  ResearchIcon,
} from "../../components/secondary/MenuIcons";

export default function TabLayout() {
  const originalWarn = console.warn;

  console.warn = (...args) => {};

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
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ResearchIcon color={color} size={size} />
          ),
          tabBarLabel: "Investigación",
        }}
      />
      <Tabs.Screen
        name="galaxy"
        options={{
          tabBarIcon: ({ color, size }) => (
            <GalaxyIcon color={color} size={size} />
          ),
          tabBarLabel: "Galaxia",
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FleetIcon color={color} size={size} />
          ),
          tabBarLabel: "Naves",
        }}
      />
    </Tabs>
  );
}
