import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n";

export default function IndexRedirect() {
  const router = useRouter();
  const { ready } = useTranslation();

  useEffect(() => {
    if (ready) router.replace("/(tabs)/menu");
  }, [ready, router]);

  return null;
}
