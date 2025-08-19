// src/components/CombatCard.tsx
import { shipConfig } from "@/src/config/shipConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import type { CombatResult, Turn } from "@/src/types/combatResultTypes";
import { ALL_SHIP_TYPES, ShipId, type ShipData, type ShipType } from "@/src/types/shipType";
import { aggregateLosses } from "@/utils/combatUtils";
import { formatDate, totalAmount } from "@/utils/generalUtils";
import { getSpecByType, isCustomType } from "@/utils/shipUtils";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

/* ------------------------------ helpers ------------------------------ */

function getPerspectiveArrays(t: Turn, playerIsAttacker: boolean) {
  if (playerIsAttacker) {
    return {
      myRemaining: t.attackerRemaining,
      enemyRemaining: t.defenderRemaining,
      myLost: t.attackerLost,
      enemyLost: t.defenderLost,
    };
  }
  return {
    myRemaining: t.defenderRemaining,
    enemyRemaining: t.attackerRemaining,
    myLost: t.defenderLost,
    enemyLost: t.attackerLost,
  };
}

export type CombatCardProps = {
  item: CombatResult;
  expanded: boolean;
  onToggle: () => void;
};

export default function CombatCard({ item, expanded, onToggle }: CombatCardProps) {
  const { t: tShip } = useTranslation("ship");
  const universe = useGameContextSelector((ctx) => ctx.universe);
  const specs = useGameContextSelector((ctx) => ctx.specs);

  const { turns, playerIsAttacker, playerWins } = item;

  const name = universe[item.sistem].name;
  const myLosses = aggregateLosses(turns, playerIsAttacker ? "attackerLost" : "defenderLost").total;

  // orden global por shipConfig.orden
  const typesOrdered = useMemo(
    () =>
      [...ALL_SHIP_TYPES].sort(
        (a, b) => shipConfig[a as ShipType].orden - shipConfig[b as ShipType].orden
      ) as ShipType[],
    []
  );

  // helper de render: "inicio - bajas" (omitiendo "- 0")
  const RenderStartLoss = ({
    start,
    lost,
    alignRight,
  }: {
    start: number;
    lost: number;
    alignRight?: boolean;
  }) => (
    <Text style={[styles.num, alignRight && styles.numRight]}>
      {start}
      {lost > 0 && <Text style={styles.lost}> - {lost}</Text>}
    </Text>
  );

  return (
    <ImageBackground
      source={expanded ? IMAGES.COMBAT_CARD_VERTICAL : IMAGES.COMBAT_CARD}
      style={styles.card}
      imageStyle={{ borderRadius: 16 }}
    >
      <View style={styles.cardOverlay}>
        {/* Header compacto (sin cambios) */}
        <View style={commonStyles.rowSpaceBetween}>
          <View>
            <Text style={commonStyles.titleBlueText}>{name}</Text>
            <Text style={commonStyles.smallSubtitle}>{formatDate(item.date)}</Text>
          </View>

          {/* NUEVO: estado + duración como dos badges */}
          <View style={styles.statusWrap}>
            <View style={styles.statusChip(playerWins)}>
              <Text style={styles.statusText(playerWins)}>
                {playerWins ? "🏆 Victoria" : "☠️ Derrota"} en {item.totalTurns} turno
                {item.totalTurns !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.actionBar}>
          <View>
            <Text style={commonStyles.whiteText}>
              {myLosses} Nave{myLosses !== 1 ? "s" : ""} perdida{myLosses !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity style={commonStyles.buttonPrimary} onPress={onToggle}>
            <Text style={commonStyles.buttonTextLight}>
              {expanded ? "Ocultar detalles" : "Ver combate"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detalle expandido */}
        {expanded && (
          <View style={styles.expandedPanel}>
            {turns.map((t, idx) => {
              // mapas por turno
              const toMap = (arr: ShipData[]) => {
                const m: Record<ShipId, number> = {} as any;
                arr.forEach((s) => (m[s.type] = (m[s.type] ?? 0) + s.amount));
                return m;
              };

              const p = getPerspectiveArrays(t, playerIsAttacker);

              // inicio del turno = remaining del turno anterior (o iniciales si turno 1)
              const prevAttacker =
                t.turn === 1 ? item.attackers : item.turns[idx - 1].attackerRemaining;
              const prevDefender =
                t.turn === 1 ? item.defenders : item.turns[idx - 1].defenderRemaining;

              const prevMy = playerIsAttacker ? prevAttacker : prevDefender;
              const prevEnemy = playerIsAttacker ? prevDefender : prevAttacker;

              const prevMyMap = toMap(prevMy);
              const prevEnemyMap = toMap(prevEnemy);
              const myLostMap = toMap(p.myLost);
              const enemyLostMap = toMap(p.enemyLost);

              // tipos con actividad en este turno en cualquiera de los dos lados
              const activeTypes = typesOrdered.filter((type) => {
                const s1 = (prevMyMap[type] ?? 0) + (myLostMap[type] ?? 0);
                const s2 = (prevEnemyMap[type] ?? 0) + (enemyLostMap[type] ?? 0);
                return s1 > 0 || s2 > 0;
              });

              const myStartTotal = totalAmount(prevMy);
              const enemyStartTotal = totalAmount(prevEnemy);

              // Totales de bajas del turno (ya calculados)
              const myLostTotal = totalAmount(p.myLost);
              const enemyLostTotal = totalAmount(p.enemyLost);

              return (
                <View key={t.turn} style={{ marginBottom: 10 }}>
                  <View style={styles.turnTotalsRow}>
                    <View style={{ flex: 1 }}>
                      <RenderStartLoss start={myStartTotal} lost={myLostTotal} />
                    </View>

                    <Text style={styles.turnTitle}>Turno {t.turn}</Text>

                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <RenderStartLoss start={enemyStartTotal} lost={enemyLostTotal} alignRight />
                    </View>
                  </View>

                  {activeTypes.length === 0 ? (
                    <Text style={styles.faint}>—</Text>
                  ) : (
                    activeTypes.map((type) => {
                      const myStart = prevMyMap[type] ?? 0;
                      const myLost = myLostMap[type] ?? 0;
                      const enemyStart = prevEnemyMap[type] ?? 0;
                      const enemyLost = enemyLostMap[type] ?? 0;

                      const spec = getSpecByType(type, specs);
                      const displayName = isCustomType(type)
                        ? spec.name
                        : tShip(`shipName.${type as ShipType}`);

                      const showLeft = myStart + myLost > 0;
                      const showRight = enemyStart + enemyLost > 0;

                      return (
                        <View key={`${t.turn}-${type}`} style={styles.pairRow}>
                          {/* IZQUIERDA: 3-1 + nombre */}
                          <View style={styles.sideCell}>
                            {showLeft ? (
                              <View style={styles.leftInline}>
                                <View style={styles.inlineGapRight}>
                                  <RenderStartLoss start={myStart} lost={myLost} />
                                </View>
                                <Text style={styles.shipName}>{displayName}</Text>
                              </View>
                            ) : (
                              <View />
                            )}
                          </View>

                          {/* DERECHA: nombre + 3-1 (número pegado a la derecha) */}
                          <View style={[styles.sideCell, styles.sideRight]}>
                            {showRight ? (
                              <View style={styles.rightInline}>
                                <Text style={styles.shipName}>{displayName}</Text>
                                <View style={styles.inlineGapLeft} />
                                <RenderStartLoss start={enemyStart} lost={enemyLost} alignRight />
                              </View>
                            ) : (
                              <View />
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

/* -------------------------------- UI -------------------------------- */

const styles = {
  card: {
    borderRadius: 16,
    overflow: "hidden" as const,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22262e",
  },
  cardOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 12,
  },
  pill: (ok: boolean) => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: ok ? "#1f6f4a" : "#6f1f1f",
  }),
  pillText: { color: "#fff", fontWeight: "700" as const, fontSize: 12 },
  value: { color: "#ffffff", fontSize: 15, fontWeight: "600" as const },

  /* expandido */
  expandedPanel: {
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.35)", // semitransparente
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  turnHeader: { color: "#e6eaf2", fontWeight: "700" as const, marginBottom: 6 },

  tripleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 3,
  },
  sideCell: { flex: 1 },
  centerCell: { flex: 1.4, alignItems: "center" as const, justifyContent: "center" as const },
  shipName: { color: "#e6eaf2", fontSize: 12, fontWeight: "700" as const },

  num: { color: "#e6eaf2", fontSize: 12, fontWeight: "700" as const, textAlign: "left" as const },
  numRight: { textAlign: "right" as const },
  lost: { color: "#ff6b6b", fontSize: 12, fontWeight: "700" as const },

  faint: { color: "#94a3b8", fontSize: 12 },
  turnTotalsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  turnTitle: { color: "#e6eaf2", fontWeight: "700" as const },
  statusWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  // Violeta para Victoria, Ámbar para Derrota (borde + fondo translúcido)
  statusChip: (win: boolean) => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: win ? "#818CF8" /* indigo-300 */ : "#810303ff" /* amber-500 */,
    backgroundColor: win ? "rgba(99,102,241,0.18)" /* indigo-500 */ : "rgba(245,158,11,0.18)",
  }),
  statusText: (win: boolean) => ({
    color: win ? "#C7D2FE" /* indigo-200 */ : "#d1f491ff" /* amber-400 */,
    fontWeight: "800" as const,
    fontSize: 13,
    letterSpacing: 0.3,
  }),

  // Badge neutro para la duración
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  metaText: { color: "#E5E7EB", fontWeight: "700" as const, fontSize: 12 },
  pairRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 3,
  },

  leftInline: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
  },

  rightInline: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const, // el número queda al borde derecho
  },

  sideRight: {
    alignItems: "flex-end" as const,
  },

  inlineGapRight: { marginRight: 6 },
  inlineGapLeft: { width: 6 },
};
