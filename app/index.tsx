import { useRouter } from "expo-router";
import i18n from "i18next";
import { useEffect } from "react";
import "../i18n";
import { NotificationManager } from "../utils/notificacionUtils";
export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    i18n.changeLanguage("es").catch((err) => {
      console.error("Error al cambiar el idioma:", err);
    });

    router.replace("/menu");
  }, []);

  useEffect(() => {
    NotificationManager.initializeNotifications();

    const requestPermissions = async () => {
      const granted = await NotificationManager.requestPermissions?.();
      if (!granted) {
        console.warn("🔕 No se concedieron permisos para notificaciones");
      }
    };

    requestPermissions();
  }, []);
  return null;
}
