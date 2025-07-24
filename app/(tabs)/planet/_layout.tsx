import { Tabs } from "expo-router";

export default function PlanetLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarStyle: { display: "none", height: 0 },
      }}
    />
  );
}
