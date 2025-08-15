import { Tabs } from "expo-router";

export default function MenuLayout() {
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
