import { GameProvider } from "@/src/context/GameContext";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Slot></Slot>
        <Toast />
      </GameProvider>
    </SafeAreaProvider>
  );
}
