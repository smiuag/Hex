import { HapticTab } from '@/components/HapticTab';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
const originalWarn = console.warn;

console.warn = (...args) => {
};
  

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
        }}
      />
      <Tabs.Screen
        name="planeta"
        options={{
          title: 'Planeta',
        }}
      />
    </Tabs>
  );
}
