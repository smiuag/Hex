import { useRouter } from "expo-router";
import { useEffect } from "react";
import { NotificationManager } from "../utils/notificacionUtils";

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/menu");
  }, []);

  useEffect(() => {
    NotificationManager.initializeNotifications(); // ✅ Llamada correcta

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
