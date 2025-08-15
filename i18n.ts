// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type Lang = "es" | "en";

const isDev = __DEV__ === true; // React Native define __DEV__

i18n.use(initReactI18next).init({
  lng: "es", // idioma por defecto
  fallbackLng: ["en"], // cae a inglés si falta en español
  ns: [
    "common",
    "resources",
    "planets",
    "buildings",
    "quests",
    "tech",
    "research",
    "ship",
    "events",
    "achievements",
  ],
  defaultNS: "common",

  // 👇 Que te “vaya diciendo” lo que falta
  debug: isDev, // logs de i18next en consola (dev)
  saveMissing: isDev, // dispara missingKey/missingKeyHandler
  // Marca visual para detectar fácilmente en UI las claves que faltan
  parseMissingKeyHandler: (key) => (isDev ? `❓${key}` : key),
  // Evita que valores "" en recursos tapen el fallback
  returnEmptyString: false,
  returnNull: false,

  resources: {
    en: {
      common: require("./assets/locales/en/common.json"),
      buildings: require("./assets/locales/en/buildings.json"),
      planets: require("./assets/locales/en/planets.json"),
      quests: require("./assets/locales/en/quests.json"),
      research: require("./assets/locales/en/research.json"),
      resources: require("./assets/locales/en/resources.json"),
      ship: require("./assets/locales/en/ship.json"),
      events: require("./assets/locales/en/events.json"),
      achievements: require("./assets/locales/en/achievements.json"),
    },
    es: {
      common: require("./assets/locales/es/common.json"),
      buildings: require("./assets/locales/es/buildings.json"),
      planets: require("./assets/locales/es/planets.json"),
      quests: require("./assets/locales/es/quests.json"),
      research: require("./assets/locales/es/research.json"),
      resources: require("./assets/locales/es/resources.json"),
      ship: require("./assets/locales/es/ship.json"),
      events: require("./assets/locales/es/events.json"),
      achievements: require("./assets/locales/es/achievements.json"),
    },
  },
});

// Evento global: cada vez que falte una clave, te la chiva aquí
if (isDev) {
  i18n.on("missingKey", (lngs, ns, key /*, res */) => {
    // lngs puede ser array (p.ej. ["es"])
    console.warn(
      `[i18n] Missing key → ns="${ns}" key="${key}" langs=${
        Array.isArray(lngs) ? lngs.join(",") : lngs
      }`
    );
  });
}

export default i18n;
