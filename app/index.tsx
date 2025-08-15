import i18n from "@/i18n";
import { loadConfig } from "@/src/services/storage";
import type { ConfigEntry } from "@/src/types/configTypes";
import { normalizeLang } from "@/utils/generalUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native"; // ✅ import correcto

export default function IndexRedirect() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg: ConfigEntry[] | null = await loadConfig();
        const saved = cfg?.find((c) => c.key === "PLAYER_LANGUAGE")?.value;
        const lang = normalizeLang(saved ?? i18n.language);
        if (normalizeLang(i18n.language) !== lang) {
          await i18n.changeLanguage(lang);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    router.replace("/(tabs)/menu");
  }, [ready, router]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  return null;
}
