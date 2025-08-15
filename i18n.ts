import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type Lang = "es" | "en";

i18n.use(initReactI18next).init({
  lng: "es",
  fallbackLng: "es",
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
  // initImmediate: false,
  // react: { useSuspense: false },
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

export default i18n;
