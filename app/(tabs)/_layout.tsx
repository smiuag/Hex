import { HapticTab } from "@/components/HapticTab";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { MenuIcon, PlanetIcon } from "../../components/MenuIcons";

export default function TabLayout() {
  const originalWarn = console.warn;

  console.warn = (...args) => {};

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        }}
      />
      <Tabs.Screen
        name="planet"
        options={{
          tabBarIcon: ({ color, size }) => (
            <PlanetIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
