import { Tabs } from "expo-router";

export default function GalaxyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: { display: "none", height: 0 },
      }}
    />
  );
}
