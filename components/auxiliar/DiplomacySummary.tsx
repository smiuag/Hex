import { IMAGES } from "@/src/constants/images";
import { DiplomacyLevel, raceConfig } from "@/src/types/raceType";
import React, { memo } from "react";
import { FlatList, Image, ImageBackground, StyleSheet, Text, View } from "react-native";

type Props = {
  data: DiplomacyLevel[];
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const buckets = [
  { max: 200, color: "#ef4444", label: "Hostile" }, // red-500
  { max: 400, color: "#f59e0b", label: "Tense" }, // amber-500
  { max: 600, color: "#eab308", label: "Neutral" }, // yellow-500
  { max: 800, color: "#06b6d4", label: "Cordial" }, // cyan-500
  { max: 1001, color: "#16a34a", label: "Allied" }, // green-600
];

const getBucket = (score: number) => buckets.find((b) => score < b.max)!;

const ItemRow = memo(({ item }: { item: DiplomacyLevel }) => {
  const s = clamp(item.diplomacyLevel, 0, 1000);
  const pct = (s / 1000) * 100;
  const { color, label } = getBucket(s);
  const config = raceConfig[item.race];

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {config.emblem ? (
          <Image source={config.emblem} style={styles.emblem} resizeMode="contain" />
        ) : (
          <View style={[styles.emblem, styles.emblemFallback]}>
            <Text style={styles.emblemText}>{config.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{config.name}</Text>
          <Text style={styles.subtitle}>{label}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.score}>{s}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
});

function DiplomacySummary({ data }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.EMBASSY_QUEST_BACKGROUND}
        style={styles.cardBg} // el contenedor con padding/borde
        imageStyle={styles.cardBgImage} // estilo de la imagen (bordes redondeados)
        resizeMode="cover"
      >
        {/* opcional: oscurecer un poco para que el texto se lea */}
        <View style={styles.overlay}>
          <FlatList
            data={data}
            keyExtractor={(it) => it.race}
            renderItem={({ item }) => <ItemRow item={item} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

export default memo(DiplomacySummary);

const styles = StyleSheet.create({
  container: { padding: 12 },

  // la "card" ahora es la propia imagen de fondo
  cardBg: {
    borderRadius: 16,
    overflow: "hidden", // recorta la imagen a los bordes redondeados
    padding: 12,
  },
  cardBgImage: {
    borderRadius: 16, // asegura el radio en la imagen
  },

  // capa opcional para contraste; quítala si no la quieres
  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 16,
    padding: 0, // o 12 si prefieres
  },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  right: { width: 130, alignItems: "flex-end" },
  emblem: { width: 36, height: 36, borderRadius: 8 },
  emblemFallback: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  emblemText: { color: "#9ca3af", fontWeight: "700" },
  name: { color: "#e5e7eb", fontSize: 15, fontWeight: "600" },
  subtitle: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  score: { color: "#e5e7eb", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  barTrack: {
    width: 120,
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.15)", // más contraste
  },
  barFill: { height: "100%" },
  separator: { height: 10 },
});
