import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CountdownTimer } from "@/components/auxiliar/CountdownTimer";
import { resourceEmojis } from "@/src/config/emojisConfig";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import type { CustomShipTypeId, Draft, ShipImageKey, ShipStats } from "@/src/types/shipType";
import { defaultCreationStats, TUNING } from "@/src/types/shipType";
import { DeepPartial, formatDuration, withDefaults } from "@/utils/generalUtils";
import {
  computeAttemptCost,
  computeAttemptTime,
  computeCaps,
  computeDraftHash,
  computeSuccessChance,
  normalizeDraft,
} from "@/utils/shipUtils";

import ImagePickerGrid from "@/components/auxiliar/ImagePickerGrid";
import ProgressBar from "@/components/auxiliar/ProgressBar";
import ResourceLines from "@/components/auxiliar/ResourceLines";
import Segmented from "@/components/auxiliar/Segmented";
import StatRow from "@/components/auxiliar/StatRow";

export default function CustomShipDesigner() {
  const { t } = useTranslation("common");
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);

  const active = useGameContextSelector((ctx) => ctx.active);
  const specs = useGameContextSelector((ctx) => ctx.specs);
  const history = useGameContextSelector((ctx) => ctx.history);
  const computeEffectiveChance = useGameContextSelector((ctx) => ctx.computeEffectiveChance);
  const resolveAttempt = useGameContextSelector((ctx) => ctx.resolveAttempt);
  const startAttempt = useGameContextSelector((ctx) => ctx.startAttempt);
  const upsertSpec = useGameContextSelector((ctx) => ctx.upsertSpec);
  const cancelActiveAttempt = useGameContextSelector((ctx) => ctx.cancelActiveAttempt);

  const [finished, setFinished] = useState(false);

  const saved = useMemo(() => {
    return playerConfig.find((cf) => cf.key === "MAX_CREATION_STATS")?.value as
      | DeepPartial<ShipStats>
      | undefined;
  }, [playerConfig]);

  const prevMax = useMemo(
    () => withDefaults(defaultCreationStats, saved),
    [saved] // asumiendo defaultCreationStats es un import constante
  );

  const caps = useMemo(() => computeCaps(prevMax, TUNING.maxMultiplier), [prevMax]);

  const [draft, setDraft] = useState<Draft>({
    name: "",
    attackTech: "LASER",
    defenseTech: "ARMOR",
    attack: prevMax.attack,
    defense: prevMax.defense,
    speed: prevMax.speed,
    hp: prevMax.hp,
    cargo: prevMax.cargo,
    imageKey: "DEFAULT_SHIP_1" as ShipImageKey,
  });

  const inProgress = active?.status === "IN_PROGRESS";
  const locked = !!inProgress; // bloquear edición cuando hay intento en curso

  // Al no estar en curso, seed con el último intento (o valores por defecto)
  useEffect(() => {
    if (inProgress) return;

    const last = history?.length ? history[history.length - 1] : undefined;

    // base: SIEMPRE parte de prevMax para las stats
    const base = {
      name: "",
      attackTech: "LASER" as const,
      defenseTech: "ARMOR" as const,
      attack: prevMax.attack,
      defense: prevMax.defense,
      speed: prevMax.speed,
      hp: prevMax.hp,
      cargo: prevMax.cargo ?? defaultCreationStats.cargo,
      imageKey: "DEFAULT_SHIP_1" as const,
    };

    // si hay último intento, solo heredamos campos “cosméticos”
    // (nombre solo si no fue success, tecnologías e imagen)
    const seeded = last
      ? {
          ...base,
          name: last.status === "SUCCEEDED" ? "" : last.draft.name ?? base.name,
          attackTech: (last.draft.attackTech ?? base.attackTech) as typeof base.attackTech,
          defenseTech: (last.draft.defenseTech ?? base.defenseTech) as typeof base.defenseTech,
          imageKey: (last.draft.imageKey ?? base.imageKey) as typeof base.imageKey,
        }
      : base;

    setDraft(() => normalizeDraft(seeded, caps));
  }, [inProgress, history, prevMax, caps, finished]);

  // Vista/calculadora: si está en curso, usamos SIEMPRE el draft del intento activo
  const draftView = useMemo(() => {
    return inProgress && active ? active.draft : draft;
  }, [inProgress, active, draft]);

  const normalized = useMemo(() => normalizeDraft(draftView, caps), [draftView, caps]);
  const attemptCost = useMemo(() => computeAttemptCost(normalized, TUNING), [normalized]);
  const attemptTime = useMemo(() => computeAttemptTime(normalized), [normalized]);

  const baseChance = useMemo(
    () => computeSuccessChance(normalized, prevMax, caps, TUNING),
    [normalized, prevMax, caps]
  );

  const {
    effective: effectiveChance,
    bonus: retryBonus,
    streak,
  } = useMemo(
    () => computeEffectiveChance(normalized, baseChance),
    [computeEffectiveChance, normalized, baseChance]
  );

  const setNum =
    (k: keyof Pick<Draft, "attack" | "defense" | "speed" | "hp" | "cargo">) => (n: number) =>
      setDraft((d) => ({ ...d, [k]: n }));

  const canAfford = enoughResources(attemptCost);

  const nameTrimmed = draftView.name.trim();
  const nameValid = nameTrimmed.length >= 3 && nameTrimmed.length < 21;

  // estado intento activo
  const activeSameDraft = active?.draftHash === computeDraftHash(normalized);
  const endsAt = inProgress ? active!.startedAt + attemptTime : 0;
  const readyToResolve = inProgress ? Date.now() >= endsAt : false;

  // si entras con intento en curso y el editor no coincide, sincroniza una vez
  useEffect(() => {
    if (active?.status === "IN_PROGRESS" && !activeSameDraft) {
      setDraft(active.draft);
    }
  }, [active?.id]);

  // iniciar intento
  const onStart = useCallback(async () => {
    if (!nameValid) {
      Alert.alert("Nombre requerido", "El nombre debe tener entre 3 y 20 caracteres.");
      return;
    }
    if (!enoughResources(attemptCost)) {
      Alert.alert(
        "Recursos insuficientes",
        "No tienes recursos suficientes para intentar este diseño."
      );
      return;
    }
    setFinished(false);
    await startAttempt({
      draft: normalized,
      baseSuccessChance: baseChance,
      attemptCost,
    });
  }, [nameValid, attemptCost, baseChance, normalized, enoughResources, startAttempt]);

  // resolver intento (usa el intento activo)
  const onResolve = useCallback(async () => {
    if (!active || active.status !== "IN_PROGRESS") return;

    const effective = Math.min(1, (active.baseSuccessChance ?? 0) + (active.bonusSuccess ?? 0));
    const ok = Math.random() < effective;

    let specId: CustomShipTypeId | undefined;

    if (ok) {
      const id: CustomShipTypeId = `custom:${
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Date.now().toString(36)
      }`;

      specId = id;

      Alert.alert("¡Diseño creado!", `Se ha añadido "${normalized.name}" a tus planos.`);
      setDraft((d) => ({ ...d, name: "" }));
    } else {
      Alert.alert(
        "Intento fallido",
        `El intento ha fallado (${Math.round(effective * 100)}% de éxito).`
      );
    }

    await resolveAttempt({ success: ok, specIdIfSuccess: specId });
  }, [active, normalized, upsertSpec, resolveAttempt]);

  const onComplete = () => setFinished(true);

  const onCancel = useCallback(async () => {
    if (!inProgress) return;

    Alert.alert(
      "Cancelación",
      "¿Estás seguro de que quieres cancelar el progreso? Perderás los recursos invertidos",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: async () => {
            await cancelActiveAttempt();
          },
        },
      ]
    );
  }, [inProgress, cancelActiveAttempt]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {!specs && (
          <Text style={styles.textMuted}>Cargando datos… usarás límites base por ahora.</Text>
        )}

        {/* ── Card 1: Selección ── */}
        <View style={styles.card}>
          <TextInput
            value={draftView.name}
            onChangeText={locked ? undefined : (name) => setDraft((d) => ({ ...d, name }))}
            placeholder="Nombre de la nave…"
            style={[styles.input, !nameValid && !locked && styles.inputError]}
            placeholderTextColor="#9aa0a6"
            selectionColor="#fff"
            editable={!locked}
          />
          {!nameValid && !locked && (
            <Text style={styles.textError}>El nombre es obligatorio (mín. 3 caracteres).</Text>
          )}

          <ImagePickerGrid
            value={draftView.imageKey}
            onChange={locked ? undefined : (k) => setDraft((d) => ({ ...d, imageKey: k }))}
          />

          <View style={styles.techRow}>
            <Segmented
              compact
              value={draftView.attackTech}
              disabled={locked}
              onChange={locked ? undefined : (v) => setDraft((d) => ({ ...d, attackTech: v }))}
              options={[
                { label: "LASER", value: "LASER" as const, emoji: resourceEmojis.KAIROX },
                { label: "PLASMA", value: "PLASMA" as const, emoji: resourceEmojis.AETHERIUM },
              ]}
            />
            <Segmented
              compact
              value={draftView.defenseTech}
              disabled={locked}
              onChange={locked ? undefined : (v) => setDraft((d) => ({ ...d, defenseTech: v }))}
              options={[
                { label: "ARMOR", value: "ARMOR" as const, emoji: resourceEmojis.ILMENITA },
                { label: "SHIELD", value: "SHIELD" as const, emoji: resourceEmojis.THARNIO },
              ]}
            />
          </View>

          <StatRow
            title="Ataque"
            value={draftView.attack}
            max={caps.attack}
            onChange={locked ? () => {} : setNum("attack")}
          />
          <StatRow
            title="Defensa"
            value={draftView.defense}
            max={caps.defense}
            onChange={locked ? () => {} : setNum("defense")}
          />
          <StatRow
            title="Velocidad"
            value={draftView.speed}
            max={caps.speed}
            onChange={locked ? () => {} : setNum("speed")}
            step={10}
            stepDown={10}
            longPressPlusToMax
          />
          <StatRow
            title="HP"
            value={draftView.hp}
            max={caps.hp}
            onChange={locked ? () => {} : setNum("hp")}
          />
          <StatRow
            title="CARGO"
            step={10000}
            stepDown={10000}
            value={draftView.cargo}
            max={caps.cargo}
            onChange={locked ? () => {} : setNum("cargo")}
          />
        </View>

        {/* ── Card 2: Resumen + Acción ── */}
        <View style={styles.card}>
          <Text style={styles.text}>
            Probabilidad de éxito: {Math.round(effectiveChance * 100)}%
            {retryBonus > 0
              ? ` (+${Math.round(retryBonus * 100)}% por intentos extra ${streak} )`
              : ""}
          </Text>
          <ProgressBar ratio={effectiveChance} />
          <ResourceLines cost={attemptCost} />

          <View style={[commonStyles.actionBar, { marginTop: 10 }]}>
            {inProgress ? (
              activeSameDraft ? (
                readyToResolve ? (
                  <Text style={commonStyles.statusTextYellow}>✅ Listo para resolver</Text>
                ) : (
                  <Text style={commonStyles.statusTextYellow}>
                    ⏳ {t("inProgress")}:{" "}
                    <CountdownTimer
                      startedAt={active!.startedAt}
                      duration={attemptTime}
                      onComplete={onComplete}
                    />
                  </Text>
                )
              ) : (
                <Text style={commonStyles.statusTextYellow}>⏳ Tienes otro diseño en curso</Text>
              )
            ) : !nameValid ? (
              <Text style={styles.textError}>⚠️ Nombre requerido (mín. 3).</Text>
            ) : canAfford ? (
              <Text style={commonStyles.statusTextYellow}>⏳ {formatDuration(attemptTime)}</Text>
            ) : (
              <Text style={commonStyles.statusTextYellow}>⚠️ Recursos insuficientes</Text>
            )}

            {/* Botones según estado */}
            {!inProgress && (
              <TouchableOpacity
                style={[
                  commonStyles.buttonPrimary,
                  (!canAfford || !nameValid) && commonStyles.buttonDisabled,
                ]}
                onPress={onStart}
                disabled={!canAfford || !nameValid}
              >
                <Text style={commonStyles.buttonTextLight}>Investigar</Text>
              </TouchableOpacity>
            )}

            {inProgress && activeSameDraft && !readyToResolve && (
              <TouchableOpacity style={[commonStyles.cancelButton]} onPress={onCancel}>
                <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            {inProgress && activeSameDraft && readyToResolve && (
              <TouchableOpacity style={[commonStyles.buttonPrimary]} onPress={onResolve}>
                <Text style={commonStyles.buttonTextLight}>Informe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

/* ───────────────────────── estilos ───────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
  container: { flex: 1, backgroundColor: "transparent" },
  text: { color: "#E6F1FF" },
  textMuted: { color: "#c6c9d6" },

  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(10,14,30,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(10,14,30,0.55)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#E6F1FF",
    marginBottom: 6,
  },
  inputError: {
    borderColor: "rgba(255, 80, 80, 0.9)",
  },
  textError: {
    color: "#ff8080",
    marginBottom: 6,
  },
  techRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
});
