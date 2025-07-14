import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import "react-native-reanimated";
import { Provider } from "../src/context/GameContext";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider>
      <Slot></Slot>
    </Provider>
  );
}
