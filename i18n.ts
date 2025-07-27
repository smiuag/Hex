import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  //compatibilityJSON: 'v3', // <= solo si necesario por los archivos
  lng: "es",
  fallbackLng: "en",
  ns: ["common", "resources", "planets", "buildings", "quests", "tech"],
  defaultNS: "common",
  resources: {
    en: {
      common: require("./assets/locales/en/common.json"),
      buildings: require("./assets/locales/en/buildings.json"),
      planets: require("./assets/locales/en/planets.json"),
      quests: require("./assets/locales/en/quests.json"),
      research: require("./assets/locales/en/research.json"),
      resources: require("./assets/locales/en/resources.json"),
      fleet: require("./assets/locales/en/fleet.json"),
    },
    es: {
      common: require("./assets/locales/es/common.json"),
      buildings: require("./assets/locales/es/buildings.json"),
      planets: require("./assets/locales/es/planets.json"),
      quests: require("./assets/locales/es/quests.json"),
      research: require("./assets/locales/es/research.json"),
      resources: require("./assets/locales/es/resources.json"),
      fleet: require("./assets/locales/es/fleet.json"),
    },
  },
});
