// i18n.ts (o i18n.js)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// --- 1) Recursos estáticos -> quedan en el bundle ---
const resources = {
  en: {
    common: require("./assets/locales/en/common.json"),
    buildings: require("./assets/locales/en/buildings.json"),
    planets: require("./assets/locales/en/planets.json"),
    quests: require("./assets/locales/en/quests.json"),
    research: require("./assets/locales/en/research.json"),
    resources: require("./assets/locales/en/resources.json"),
    ship: require("./assets/locales/en/ship.json"),
    events: require("./assets/locales/en/events.json"),
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
  },
} as const;

// --- 2) Validador en desarrollo: compara forma/tipos EN vs ES ---
if (__DEV__) {
  const typeOf = (v: any) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);

  const compareShapes = (a: any, b: any, path: string) => {
    const ta = typeOf(a);
    const tb = typeOf(b);
    if (ta !== tb) {
      console.warn(`[i18n shape] Tipo distinto en "${path}": EN=${ta} vs ES=${tb}`);
      return;
    }
    if (ta === "object") {
      const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
      for (const k of keys) {
        if (!(k in a)) {
          console.warn(`[i18n missing] Falta EN "${path}.${k}"`);
          continue;
        }
        if (!(k in b)) {
          console.warn(`[i18n missing] Falta ES "${path}.${k}"`);
          continue;
        }
        compareShapes(a[k], b[k], path ? `${path}.${k}` : k);
      }
    }
    if (ta === "array") {
      // Opcional: chequea forma del primer elemento
      if (a.length && b.length) {
        const a0 = a[0],
          b0 = b[0];
        if (typeOf(a0) !== typeOf(b0)) {
          console.warn(
            `[i18n shape] Elementos distintos en "${path}[]": EN=${typeOf(a0)} vs ES=${typeOf(b0)}`
          );
        }
      }
    }
  };

  const namespaces = [
    "common",
    "resources",
    "planets",
    "buildings",
    "quests",
    "research",
    "ship",
    "events",
  ] as const;
  for (const ns of namespaces) {
    const enNS = (resources as any).en?.[ns];
    const esNS = (resources as any).es?.[ns];
    if (!enNS || !esNS) {
      console.warn(`[i18n missing ns] Falta namespace "${ns}" en EN o ES`);
      continue;
    }
    compareShapes(enNS, esNS, ns);
  }
}

// --- 3) Inicialización i18next ---
i18n.use(initReactI18next).init({
  lng: "es",
  // Si más adelante usas el idioma del dispositivo:
  // load: "languageOnly",
  fallbackLng: ["es", "en"],
  ns: ["common", "resources", "planets", "buildings", "quests", "research", "ship", "events"],
  defaultNS: "common",
  resources,
  interpolation: { escapeValue: false },
  returnNull: false,
  debug: __DEV__,
  initImmediate: false, // evita carreras en release
  react: { useSuspense: false }, // espera a ready para renderizar
});

// --- 4) Log de claves faltantes ---
i18n.on("missingKey", (lngs, ns, key) => {
  console.warn(`[i18n missing] ${ns}:${key} (lngs=${lngs.join(",")})`);
});

export default i18n;
