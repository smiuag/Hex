import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { resourceEmojis } from "@/src/config/emojisConfig";
import { shipConfig } from "@/src/config/shipConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { ShipData, ShipType } from "@/src/types/shipType";
import { Balances, BLACKMARKET_TRADE_VALUE, BMEntry, BMMap, Meta } from "@/src/types/tradeTypes";
import { formatAmount } from "@/utils/generalUtils";
import { getAccumulatedResources } from "@/utils/resourceUtils";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import HeaderClose from "../auxiliar/HeaderClose";

/* ======================= Slider base (alto, commit al soltar) ======================= */
const Slider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
}> = ({ min, max, value, onChange, onCommit }) => {
  const trackRef = useRef<View>(null);
  const metrics = useRef({ left: 0, width: 1 });
  const lastDraftRef = useRef(value);

  // “margen virtual” y snap
  const EDGE_SLOP_PX = 24;
  const SNAP_PCT = 0.06;

  useEffect(() => {
    lastDraftRef.current = value;
  }, [value]);

  const clampInt = (n: number) => Math.max(min, Math.min(max, Math.round(n)));

  const measureTrack = () => {
    const node = trackRef.current as any;
    if (node?.measureInWindow) {
      node.measureInWindow((x: number, _y: number, w: number) => {
        metrics.current = { left: x, width: Math.max(1, w) };
      });
    }
  };

  const setFromPageX = (pageX: number) => {
    const { left, width } = metrics.current;
    const rel = pageX - left;

    // mapeo con slop
    let r = (rel + EDGE_SLOP_PX) / (width + EDGE_SLOP_PX * 2);
    r = Math.max(0, Math.min(1, r));

    // snap extremos
    if (r < SNAP_PCT) r = 0;
    else if (r > 1 - SNAP_PCT) r = 1;

    const next = clampInt(min + r * (max - min));
    lastDraftRef.current = next;
    if (next !== value) onChange(next);
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          measureTrack();
          setFromPageX(evt.nativeEvent.pageX);
        },
        onPanResponderMove: (_evt, g) => {
          if (Number.isFinite(g.moveX)) setFromPageX(g.moveX);
        },
        onPanResponderRelease: () => onCommit?.(lastDraftRef.current),
        onPanResponderTerminate: () => onCommit?.(lastDraftRef.current),
      }),
    [min, max, onCommit, value]
  );

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const fillPct = Math.max(0, Math.min(1, ratio));

  return (
    <View style={styles.sliderContainer}>
      <View ref={trackRef} style={styles.sliderTrack} {...pan.panHandlers}>
        <View pointerEvents="none" style={[styles.sliderFill, { width: `${fillPct * 100}%` }]}>
          <Text style={styles.sliderFillText}>
            {formatAmount(Math.max(min, Math.min(value, max)))}
          </Text>
        </View>
        <View pointerEvents="none" style={[styles.sliderThumb, { left: `${fillPct * 100}%` }]} />
      </View>
    </View>
  );
};

const QuantitySlider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}> = ({ min, max, value, onChange, onCommit }) => {
  const dec = () => onCommit(Math.max(min, value - 1));
  const inc = () => onCommit(Math.min(max, value + 1));
  return (
    <View style={styles.qtyRow}>
      <TouchableOpacity
        onPress={dec}
        disabled={value <= min}
        style={[styles.stepperBtn, value <= min && styles.btnDisabled]}
      >
        <Text style={styles.stepperBtnText}>−1</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Slider min={min} max={max} value={value} onChange={onChange} onCommit={onCommit} />
      </View>
      <TouchableOpacity
        onPress={inc}
        disabled={value >= max}
        style={[styles.stepperBtn, value >= max && styles.btnDisabled]}
      >
        <Text style={styles.stepperBtnText}>+1</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ====== Fila de pago: info a la IZQUIERDA, barra a la DERECHA ====== */
const ResourceAdjustRow: React.FC<{
  name: string;
  icon?: string;
  balance: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ name, icon, balance, value, onChange }) => (
  <View style={styles.payRow}>
    {/* Info IZQ */}
    <View style={styles.payInfo}>
      {typeof icon === "string" && icon.length > 0 ? (
        /^https?:\/\//.test(icon) ? (
          <Image source={{ uri: icon }} style={styles.icon} />
        ) : (
          <Text style={styles.emoji}>{icon}</Text>
        )
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      <Text style={styles.resourceName}>{name}</Text>
    </View>

    {/* Barra DER */}
    <View style={styles.paySliderBox}>
      <Slider min={0} max={balance} value={value} onChange={onChange} onCommit={onChange} />
    </View>
  </View>
);

/* ======================= Componente principal ======================= */
export default function BlackMarketComponent() {
  const router = useRouter();
  const storedResources = useGameContextSelector((ctx) => ctx.resources);
  const addResources = useGameContextSelector((ctx) => ctx.addResources);
  const subtractResources = useGameContextSelector((ctx) => ctx.subtractResources);
  const discoverNextResearch = useGameContextSelector((ctx) => ctx.discoverNextResearch);
  const handleCreateShips = useGameContextSelector((ctx) => ctx.handleCreateShips);

  // Puede ser función o boolean, soportamos ambos
  const hasDiscoverableResearchFromCtx = useGameContextSelector(
    (ctx) => (ctx as any).hasDiscoverableResearch
  );
  const hasSpecialOffer = useMemo(() => {
    try {
      return typeof hasDiscoverableResearchFromCtx === "function"
        ? !!hasDiscoverableResearchFromCtx()
        : !!hasDiscoverableResearchFromCtx;
    } catch {
      return false;
    }
  }, [hasDiscoverableResearchFromCtx]);

  const { resources } = getAccumulatedResources(storedResources);
  const pricing = BLACKMARKET_TRADE_VALUE as unknown as BMMap;

  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");
  const { t: tResources } = useTranslation("resources");

  const meta: Record<string, Meta> = useMemo(() => {
    const out: Record<string, Meta> = {};
    (Object.entries(pricing) as [string, BMEntry][]).forEach(([key, entry]) => {
      const name =
        entry.KIND === "RESOURCE"
          ? tResources(`resourceType.${entry.TYPE}`, entry.TYPE)
          : entry.KIND === "SHIP"
          ? tShip(`shipName.${entry.TYPE}`, entry.TYPE)
          : "Especial";

      const m: Meta = { name };
      const byType = (resourceEmojis as Record<string, string>)[entry.TYPE];
      const byKey = (resourceEmojis as Record<string, string>)[key];
      if (byType) m.icon = byType;
      else if (byKey) m.icon = byKey;

      if (entry.KIND === "SHIP") {
        const sc = (shipConfig as any)[entry.TYPE];
        if (sc?.imageBackground) m.imageSource = sc.imageBackground as ImageSourcePropType;
      }

      if (entry.KIND === "SPECIAL") m.imageSource = IMAGES.TRADE_UNLOCK_RESEARCH;

      out[key] = m;
    });
    return out;
  }, [pricing, t, tShip, tResources]);

  // Balances normalizados
  const balances: Balances = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(resources ?? {}).map(([k, v]) => [k, Math.floor((v as number) ?? 0)])
      ) as Balances,
    [resources]
  );

  // Ítems vendibles (OFFERED), filtrando SPECIAL si no hay nada por descubrir
  const itemKeys = useMemo(() => {
    return Object.keys(pricing).filter((k) => {
      const entry = pricing[k];
      if ((entry?.OFFERED ?? 0) <= 0) return false;
      if (entry?.KIND === "SPECIAL" && !hasSpecialOffer) return false;
      return true;
    });
  }, [pricing, hasSpecialOffer]);

  const [selectedItemKey, setSelectedItemKey] = useState<string | undefined>(itemKeys[0]);

  // Si el seleccionado desaparece (p. ej., se oculta SPECIAL), re-selecciona el primero válido
  useEffect(() => {
    if (!selectedItemKey || !itemKeys.includes(selectedItemKey)) {
      setSelectedItemKey(itemKeys[0]);
    }
  }, [itemKeys, selectedItemKey]);

  // Entrada seleccionada y recurso prohibido para pagar (si compras RECURSO)
  const selectedEntry = selectedItemKey ? pricing[selectedItemKey] : undefined;
  const forbiddenPayKey = useMemo(() => {
    if (selectedEntry?.KIND === "RESOURCE") return selectedEntry.TYPE;
    return undefined;
  }, [selectedEntry]);

  // Recursos con los que se puede pagar (del inventario), excluyendo el prohibido
  const payResourceKeys = useMemo(() => {
    const resourceKeys = Object.keys(resources ?? {});
    return resourceKeys.filter(
      (k) => k !== forbiddenPayKey && (pricing[k]?.WANTED ?? 0) > 0 && (balances[k] ?? 0) > 0
    );
  }, [resources, balances, pricing, forbiddenPayKey]);

  // Billetera total en valor WANTED
  const walletValue = useMemo(
    () =>
      payResourceKeys.reduce((acc, k) => acc + (balances[k] ?? 0) * (pricing[k]?.WANTED ?? 0), 0),
    [payResourceKeys, balances, pricing]
  );

  const maxAffordableQtyBM = (itemKey: string) => {
    const unit = pricing[itemKey]?.OFFERED ?? 0;
    if (unit <= 0) return 0;
    return Math.floor(walletValue / unit);
  };

  // Máximo por ítem
  const itemMaxMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const k of itemKeys) m[k] = maxAffordableQtyBM(k);
    return m;
  }, [itemKeys, walletValue]);

  const [qty, setQty] = useState<number>(1);
  const [draftQty, setDraftQty] = useState<number>(1);

  const unitPrice = useMemo(
    () => (selectedItemKey ? pricing[selectedItemKey]?.OFFERED ?? 0 : 0),
    [pricing, selectedItemKey]
  );
  const maxQty = useMemo(
    () => (selectedItemKey ? itemMaxMap[selectedItemKey] ?? 0 : 0),
    [itemMaxMap, selectedItemKey]
  );

  useEffect(() => {
    if (maxQty <= 0) {
      setQty(0);
      setDraftQty(0);
      return;
    }
    const next = Math.min(Math.max(1, qty || 1), maxQty);
    if (next !== qty) setQty(next);
    if (draftQty < 1 || draftQty > maxQty) setDraftQty(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxQty, selectedItemKey]);

  const requiredValue = Math.max(0, Math.floor(unitPrice * (qty || 0)));

  // Pago manual
  const [manualMix, setManualMix] = useState<Record<string, number>>({});
  const setManualValue = (k: string, v: number) => {
    setManualMix((mm) => {
      const next = Math.min(Math.max(0, Math.floor(v)), balances[k] ?? 0);
      if (next <= 0) {
        const { [k]: _, ...rest } = mm;
        return rest;
      }
      return { ...mm, [k]: next };
    });
  };

  // Si el recurso pasa a estar prohibido (porque cambias lo comprado), límpialo del mix
  useEffect(() => {
    if (!forbiddenPayKey) return;
    setManualMix((mm) => {
      if (!(forbiddenPayKey in mm)) return mm;
      const { [forbiddenPayKey]: _, ...rest } = mm;
      return rest;
    });
  }, [forbiddenPayKey]);

  const contributedValue = useMemo(
    () =>
      Object.entries(manualMix).reduce(
        (acc, [k, v]) => acc + (pricing[k]?.WANTED ?? 0) * (v ?? 0),
        0
      ),
    [manualMix, pricing]
  );

  const ok = contributedValue >= requiredValue;
  const canConfirm = !!selectedItemKey && (qty || 0) > 0 && ok && maxQty > 0;

  const handleConfirm = () => {
    if (!selectedItemKey) return;
    if ((qty || 0) <= 0) return;

    const entry = pricing[selectedItemKey];
    if (!entry) return;

    if (contributedValue < requiredValue) return;

    // 1) Cobrar SIEMPRE (con fallback)
    const payment: Record<string, number> = {};
    for (const [k, v] of Object.entries(manualMix)) {
      const safe = Math.max(0, Math.min(Math.floor(v || 0), balances[k] ?? 0));
      if (safe > 0) payment[k] = safe;
    }
    if (Object.keys(payment).length > 0) {
      if (subtractResources) {
        subtractResources(payment);
      } else if (addResources) {
        const negative = Object.fromEntries(
          Object.entries(payment).map(([k, v]) => [k, -Math.abs(v)])
        );
        addResources(negative);
      }
    }

    // 2) Entregar
    try {
      switch (entry.KIND) {
        case "RESOURCE": {
          const amountPerUnit = (entry as any).AMOUNT ?? 1; // packs por unidad si aplica
          const mods: Record<string, number> = { [entry.TYPE]: amountPerUnit * (qty || 0) };
          addResources(mods);
          break;
        }
        case "SHIP": {
          const ships: ShipData[] = [{ type: entry.TYPE as ShipType, amount: qty }];
          handleCreateShips(ships);
          break;
        }
        case "SPECIAL": {
          for (let i = 0; i < (qty || 1); i++) {
            discoverNextResearch();
          }
          break;
        }
        default:
          console.warn("Tipo de ítem no soportado:", entry.KIND);
      }
    } catch (e) {
      console.error("Error al aplicar recompensas:", e);
    }

    setManualMix({});
    setQty(1);
    setDraftQty(1);
  };

  const onClose = () => {
    router.replace("/(tabs)/planet/embassy");
  };

  return (
    <>
      <HeaderClose title="Mercado negro" onClose={onClose} />
      <View style={commonStyles.flex1}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* ======= Layout con dos tarjetas separadas ======= */}
          <View style={styles.screen}>
            {/* Tarjeta: Qué compras */}
            <ImageBackground
              source={IMAGES.TRADE_OFFER}
              style={styles.cardBg}
              imageStyle={styles.cardBgImage}
            >
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={styles.cardTitle}>Compra</Text>
                <Text style={styles.cardHeaderIcon}>🛒</Text>
              </View>

              <FlatList
                data={itemKeys}
                horizontal
                keyExtractor={(k) => k}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
                renderItem={({ item: k }) => {
                  const m = meta[k] || {};
                  const affordMax = itemMaxMap[k] ?? 0;
                  const disabled = affordMax <= 0;
                  const selected = selectedItemKey === k && !disabled;
                  return (
                    <TouchableOpacity
                      onPress={() => !disabled && setSelectedItemKey(k)}
                      disabled={disabled}
                      style={[
                        styles.itemCard,
                        selected && styles.itemCardSelected,
                        disabled && styles.itemCardDisabled,
                      ]}
                    >
                      {m.imageSource || m.image ? (
                        <View style={styles.itemImageBox}>
                          <Image
                            source={m.imageSource ?? ({ uri: m.image } as any)}
                            style={styles.itemImage}
                            resizeMode="stretch"
                          />
                        </View>
                      ) : m.icon ? (
                        <View style={styles.itemEmojiBox}>
                          <Text style={styles.itemEmoji}>{m.icon}</Text>
                        </View>
                      ) : (
                        <View style={styles.itemImagePlaceholder} />
                      )}
                      <Text style={[styles.itemName, disabled && styles.muted]} numberOfLines={1}>
                        {m.name || k}
                      </Text>
                      {!disabled ? (
                        <View style={styles.pill}>
                          <Text style={styles.pillText}>Hasta {formatAmount(affordMax)}</Text>
                        </View>
                      ) : (
                        <View style={[styles.pill, styles.pillWarn]}>
                          <Text style={styles.pillWarnText}>Sin fondos</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Cantidad */}
              <View style={{ marginTop: 8 }}>
                <QuantitySlider
                  min={1}
                  max={maxQty}
                  value={Math.max(1, draftQty)}
                  onChange={setDraftQty}
                  onCommit={(v) => {
                    setDraftQty(v);
                    setQty(v);
                  }}
                />
              </View>
            </ImageBackground>

            {/* Tarjeta: Con qué pagas */}
            <ImageBackground
              source={IMAGES.TRADE_PAYMENT}
              style={styles.cardBg}
              imageStyle={styles.cardBgImage}
            >
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={styles.cardTitle}>Pago</Text>
                <Text style={styles.cardHeaderIcon}>💰</Text>
              </View>

              <View style={{ marginTop: 6, gap: 8 }}>
                {payResourceKeys.map((k) => (
                  <ResourceAdjustRow
                    key={k}
                    name={meta[k]?.name || k}
                    icon={meta[k]?.icon}
                    balance={balances[k] ?? 0}
                    value={manualMix[k] ?? 0}
                    onChange={(v) => setManualValue(k, v)}
                  />
                ))}
              </View>

              {/* Acciones dentro de la tarjeta de pago */}
              <View style={[commonStyles.actionBar, { marginTop: 12 }]}>
                {!canConfirm ? (
                  <Text style={commonStyles.whiteText}>Pago insuficiente</Text>
                ) : (
                  <View />
                )}
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={!canConfirm}
                  style={[commonStyles.buttonPrimary, !canConfirm && commonStyles.buttonDisabled]}
                >
                  <Text style={commonStyles.buttonTextLight}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

/* ======================= Estilos ======================= */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 14,
    gap: 14,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#203047",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderIcon: { fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#e5e7eb" },

  itemCard: {
    width: 156,
    minHeight: 172,
    borderRadius: 14,
    backgroundColor: "rgba(11, 20, 34, 0.60)",
    borderWidth: 1,
    borderColor: "rgba(39, 70, 107, 0.65)",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemCardSelected: {
    borderColor: "#60a5fa",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  itemCardDisabled: { opacity: 0.55 },
  itemName: { color: "#e5e7eb", fontSize: 12, textAlign: "center" },
  muted: { color: "#8892a6" },

  itemImageBox: {
    width: 96,
    height: 96,
    borderRadius: 10,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%" },
  itemImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  itemEmojiBox: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: "rgba(2, 6, 23, 0.45)",
    borderColor: "rgba(39, 70, 107, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: {
    fontSize: 44,
    lineHeight: 48,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  pill: {
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(11, 34, 60, 0.60)",
    borderWidth: 1,
    borderColor: "rgba(39, 70, 107, 0.60)",
  },
  pillText: { color: "#9ecbff", fontSize: 11, fontWeight: "600" },
  pillWarn: { backgroundColor: "#3c0b0b", borderColor: "#6b1f1f" },
  pillWarnText: { color: "#ff9e9e", fontSize: 11, fontWeight: "600" },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2b3a4f",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 20, 34, 0.60)",
  },
  btnDisabled: { opacity: 0.5 },
  stepperBtnText: { color: "#e5e7eb", fontSize: 14, fontWeight: "700" },

  sliderContainer: { paddingVertical: 0, justifyContent: "center" },
  sliderTrack: {
    height: 36,
    backgroundColor: "rgba(179, 200, 235, 0.49)",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(43, 58, 79, 0.60)",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4270a8c2",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderFillText: { color: "#0b0e12", fontSize: 14, fontWeight: "700", paddingHorizontal: 8 },
  sliderThumb: {
    position: "absolute",
    top: 0,
    width: 36,
    height: 36,
    marginLeft: -18,
    borderRadius: 18,
    backgroundColor: "#8ea9c6ff",
    borderWidth: 2,
    borderColor: "#1f2937",
  },

  /* ====== Pago: info a la IZQ y barra a la DER ====== */
  sectionLabel: { fontSize: 12, color: "#9ca3af", marginBottom: 6 },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 120, // ancho estable para alinear
  },
  paySliderBox: { flex: 1 },

  icon: { width: 18, height: 18, borderRadius: 6 },
  emoji: { fontSize: 16 },
  iconPlaceholder: { width: 18, height: 18, backgroundColor: "#111827", borderRadius: 6 },
  resourceName: { color: "#e5e7eb" },

  btnPrimaryText: { color: "#e5e7eb", fontWeight: "700" },
  cardBg: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
    borderWidth: 1,
    borderColor: "white",
  },
  cardBgImage: {
    borderRadius: 16,
  },
});
