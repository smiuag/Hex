// src/screens/AchievementsScreen.tsx
import { achievementConfig } from "@/src/config/achievementConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import {
  AchievementCategory,
  AchievementConfig,
  CATEGORY_ICON,
  PlayerAchievement,
  ProgressInfo,
  toProgressInfo,
} from "@/src/types/achievementTypes";
import { getProgressRatioSafe, getProgressSafe, pointsOfTier } from "@/utils/achievementsUtils";
import { formatAmount } from "@/utils/generalUtils";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  ImageBackground,
  SectionList,
  SectionListData,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = { style?: ViewStyle };

export default function AchievementsComponent({ style }: Props) {
  const playerAchievements = useGameContextSelector((ctx) => ctx.playerAchievements);
  const getProgress = useGameContextSelector((ctx) => ctx.getProgress);

  const { t: tAchievements } = useTranslation("achievements");

  // Mapa id -> estado jugador
  const playerById = useMemo(() => {
    const m = new Map<string, PlayerAchievement>();
    for (const a of playerAchievements) m.set(a.id, a);
    return m;
  }, [playerAchievements]);

  // Construye secciones por categoría (con contadores desbloqueados/total)
  const sections = useMemo(() => {
    const grouped = new Map<AchievementCategory, AchievementConfig[]>();
    for (const cfg of achievementConfig) {
      const arr = grouped.get(cfg.category) ?? [];
      arr.push(cfg);
      grouped.set(cfg.category, arr);
    }

    const toSection = (cat: AchievementCategory) => {
      const list = (grouped.get(cat) ?? []).slice();

      // orden: desbloqueados > en progreso > bloqueados (secretos al final)
      const data = list.sort((a, b) => {
        const pa = playerById.get(a.id);
        const pb = playerById.get(b.id);
        const aUnlocked = (pa?.unlockedTier ?? 0) > 0;
        const bUnlocked = (pb?.unlockedTier ?? 0) > 0;
        if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;

        const aSecretLocked = a.secret && !aUnlocked;
        const bSecretLocked = b.secret && !bUnlocked;
        if (aSecretLocked !== bSecretLocked) return aSecretLocked ? 1 : -1;

        // por progreso (ratio) descendente (seguro)
        const ar = getProgressRatioSafe(getProgress, a.id);
        const br = getProgressRatioSafe(getProgress, b.id);
        return br - ar;
      });

      const unlocked = list.reduce(
        (acc, c) => acc + ((playerById.get(c.id)?.unlockedTier ?? 0) > 0 ? 1 : 0),
        0
      );

      return {
        title: `${CATEGORY_ICON[cat]} ${tAchievements(cat, { defaultValue: cat })}`,
        data,
        key: cat,
        unlocked,
        total: list.length,
      };
    };

    return (Object.keys(CATEGORY_ICON) as AchievementCategory[]).map(toSection);
  }, [tAchievements, getProgress, playerById]);

  const getProgressNorm = useMemo(
    () =>
      (id: string): ProgressInfo => {
        try {
          const raw = getProgress?.(id) as Partial<ProgressInfo> | undefined;
          return toProgressInfo(raw);
        } catch {
          return toProgressInfo();
        }
      },
    [getProgress]
  );

  return (
    <View style={[styles.container, style]}>
      <ImageBackground source={IMAGES.BACKGROUND_GALAXY} style={styles.bg} resizeMode="cover">
        <SectionList
          sections={sections as unknown as SectionListData<AchievementConfig>[]}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }: any) => (
            <StickyHeader title={section.title} unlocked={section.unlocked} total={section.total} />
          )}
          renderItem={({ item: cfg }) => {
            const p = playerById.get(cfg.id);
            return (
              <AchievementRow cfg={cfg} p={p} t={tAchievements} getProgress={getProgressNorm} />
            );
          }}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled
        />
      </ImageBackground>
    </View>
  );
}

function StickyHeader({
  title,
  unlocked,
  total,
}: {
  title: string;
  unlocked: number;
  total: number;
}) {
  return (
    <View style={styles.stickyHeaderWrap}>
      <LinearGradient
        colors={["rgba(29,38,58,0.92)", "rgba(20,26,40,0.92)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stickyHeaderBg}
      />
      <View style={styles.stickyHeaderContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>
            {unlocked}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AchievementRow({
  cfg,
  p,
  t,
  getProgress,
}: {
  cfg: AchievementConfig;
  p?: PlayerAchievement;
  t: (k: string, opts?: any) => string;
  getProgress: (id: string) => {
    progress: number;
    unlockedTier: number;
    claimedTier: number;
    nextThreshold: number;
    ratio: number;
  };
}) {
  const unlockedTier = p?.unlockedTier ?? 0;
  const isSecretLocked = cfg.secret === true && unlockedTier === 0;

  const tierForText =
    unlockedTier > 0
      ? cfg.tiers.find((t2) => t2.tier === unlockedTier) ?? cfg.tiers[0]
      : cfg.tiers[0];

  const title = isSecretLocked
    ? t("secret.title", { defaultValue: "Logro secreto" })
    : t(tierForText.titleKey, { defaultValue: tierForText.titleKey });

  const desc = isSecretLocked
    ? t("secret.desc", { defaultValue: "??? Mantén los ojos abiertos." })
    : t(tierForText.descKey, { defaultValue: tierForText.descKey });

  const showBar = cfg.metric.kind === "counter" || cfg.metric.kind === "set";
  const gp = getProgressSafe(getProgress, cfg.id);
  const ratio = showBar ? gp.ratio : unlockedTier > 0 ? 1 : 0;

  const tiersTotal = cfg.tiers.length;

  return (
    <ImageBackground
      source={IMAGES.ACHIEVEMENT_BACKGROUND}
      style={[styles.card, isSecretLocked && styles.cardSecret]}
      imageStyle={styles.cardBgImage} // opacidad y border radius sólo en la imagen
      resizeMode="cover"
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, isSecretLocked && styles.secretText]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.badges}>
          <TierBadge unlocked={unlockedTier} total={tiersTotal} secret={isSecretLocked} />
          {pointsOfTier(cfg, unlockedTier) > 0 && (
            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>+{pointsOfTier(cfg, unlockedTier)}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.cardDesc, isSecretLocked && styles.secretText]} numberOfLines={2}>
        {desc}
      </Text>

      <View style={styles.progressRow}>
        <ProgressBar ratio={ratio} dimmed={isSecretLocked} />
        {showBar && !isSecretLocked && (
          <Text style={styles.progressText}>
            {formatAmount(gp.progress)} / {formatAmount(gp.nextThreshold)}
          </Text>
        )}
        {!showBar && <Text style={styles.progressText}>{unlockedTier > 0 ? "✔" : "—"}</Text>}
      </View>
    </ImageBackground>
  );
}

function TierBadge({
  unlocked,
  total,
  secret,
}: {
  unlocked: number;
  total: number;
  secret: boolean;
}) {
  return (
    <View style={[styles.tierBadge, secret && styles.tierBadgeSecret]}>
      <Text style={[styles.tierBadgeText, secret && styles.secretText]}>
        {unlocked}/{total}
      </Text>
    </View>
  );
}

function ProgressBar({ ratio, dimmed }: { ratio: number; dimmed?: boolean }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, ratio || 0));
    Animated.timing(width, {
      toValue: clamped,
      duration: 550,
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  const w = width.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={[styles.barOuter, dimmed && styles.barOuterDimmed]}>
      <Animated.View style={[styles.barInner, { width: w }]}>
        <LinearGradient
          colors={["#63B3FF", "#7B61FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  bg: { flex: 1 }, // <- asegura que el fondo ocupe toda la pantalla
  listContent: { padding: 16, paddingBottom: 28 },

  // Sticky header con 4 esquinas redondeadas y más separación
  stickyHeaderWrap: {
    position: "relative",
    marginTop: 18,
    marginBottom: 12, // separación con las tarjetas
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden", // necesario para que el radio se vea al hacer sticky
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  stickyHeaderBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12, // 4 esquinas
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#E9ECF1",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(124, 99, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(124, 99, 255, 0.35)",
  },
  headerPillText: { color: "#C9C0FF", fontSize: 12, fontWeight: "700" },

  // Cards: borde blanco fino y fondo opaco uniforme (sin “doble tarjeta”)
  card: {
    backgroundColor: "#161A24", // color base detrás de la imagen
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    overflow: "hidden", // recorta la imagen al radio
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  cardSecret: {
    backgroundColor: "#141824",
    borderStyle: "dashed",
  },
  cardBgImage: {
    opacity: 0.16, // “bastante transparencia”
    borderRadius: 14, // asegura esquinas redondeadas en la imagen
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badges: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  cardDesc: { color: "#B0B6C6", fontSize: 13, marginTop: 6 },
  secretText: { color: "#7C86A5" },

  // Tier & puntos
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(35, 45, 75, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(120, 140, 200, 0.25)",
  },
  tierBadgeSecret: {
    backgroundColor: "rgba(30, 36, 60, 0.6)",
    borderColor: "rgba(120, 140, 200, 0.18)",
  },
  tierBadgeText: { color: "#D6DBE8", fontSize: 12, fontWeight: "700" },
  pointsPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#5F7BFF",
  },
  pointsText: { color: "white", fontSize: 12, fontWeight: "700" },

  // Progreso
  progressRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barOuter: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  barOuterDimmed: { opacity: 0.6 },
  barInner: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressText: {
    color: "#CFD6E6",
    fontSize: 12,
    minWidth: 90,
    textAlign: "right",
  },
});
