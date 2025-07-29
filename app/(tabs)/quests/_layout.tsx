import { Tabs } from "expo-router";

export default function QuestsLayout() {
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
