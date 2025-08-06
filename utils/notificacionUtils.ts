// import Constants from "expo-constants";
// import * as Notifications from "expo-notifications";
// import { Platform } from "react-native";

// // Solo se permiten notificaciones si no estás en Expo Go o web
// const canSendNotifications = (): boolean => {
//   return !Constants.expoGoConfig && Platform.OS !== "web";
// };

// // Configuración del manejador de notificaciones entrantes
// const initializeNotifications = () => {
//   if (!canSendNotifications()) return null;

//   Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: false,
//       shouldShowBanner: true,
//       shouldShowList: true,
//     }),
//   });
// };

// // Solicita permisos de notificaciones
// const requestPermissions = async (): Promise<boolean> => {
//   if (!canSendNotifications()) return false;

//   const settings = await Notifications.getPermissionsAsync();
//   if (
//     settings.granted ||
//     settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
//   ) {
//     return true;
//   }

//   const { granted } = await Notifications.requestPermissionsAsync();
//   return granted;
// };

// // Opciones para agendar una notificación con retardo (delay)
// type ScheduleOptions = {
//   title: string;
//   body: string;
//   delayMs: number; // Tiempo en milisegundos
// };

// // Agenda una notificación local
// const scheduleNotification = async (
//   options: ScheduleOptions
// ): Promise<string | null> => {
//   if (!canSendNotifications()) return null;

//   const { title, body, delayMs } = options;

//   const permissionGranted = await requestPermissions();
//   if (!permissionGranted) return null;

//   const trigger: Notifications.TimeIntervalTriggerInput = {
//     type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//     seconds: Math.ceil(delayMs / 1000),
//     repeats: false,
//   };

//   const id = await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       sound: true,
//     },
//     trigger,
//   });

//   return id;
// };

// // Cancela una notificación programada
// const cancelNotification = async (
//   notificationId: string
// ): Promise<void | null> => {
//   if (!canSendNotifications()) return null;
//   await Notifications.cancelScheduledNotificationAsync(notificationId);
// };

// const cancelAllNotifications = async (): Promise<void> => {
//   if (!canSendNotifications()) return;
//   await Notifications.cancelAllScheduledNotificationsAsync();
// };

// // Exporta la API de notificaciones
// export const NotificationManager = {
//   initializeNotifications,
//   requestPermissions,
//   scheduleNotification,
//   cancelNotification,
//   cancelAllNotifications,
// };
