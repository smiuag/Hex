import i18n from "@/i18n";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native"; // ✅ import correcto

export default function IndexRedirect() {
  const router = useRouter();
  const [ready, setReady] = React.useState(i18n.isInitialized);

  useEffect(() => {
    const onInit = () => setReady(true);
    if (!i18n.isInitialized) i18n.on("initialized", onInit);
    return () => i18n.off("initialized", onInit);
  }, []);

  if (!ready) return null;

  useEffect(() => {
    if (!ready) return;
    router.replace("/(tabs)/menu");
  }, [ready, router]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  return null;
}
