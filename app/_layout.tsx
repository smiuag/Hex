import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import { Provider } from "../src/context/GameContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider>
      <StatusBar />
      <Slot></Slot>
    </Provider>
  );
}
