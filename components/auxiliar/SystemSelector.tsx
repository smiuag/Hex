import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export type MatchMode3 = "off" | "any" | "all";
type TabKey = "races" | "resources" | "buildings" | "status";

type Option = { id: string; label: string; emoji?: string; image?: ImageSourcePropType };

type Props = {
  raceSel: Set<string>;
  resSel: Set<string>;
  bldSel: Set<string>;
  statusSel: Set<string>;
  resMode: MatchMode3;
  bldMode: MatchMode3;
  statusMode: MatchMode3; // no se usa en UI (status siempre “any” si hay selección)

  options: {
    races: Option[];
    resources: Option[];
    buildings: Option[];
    status: Option[];
  };

  onApplyRaces: (sel: Set<string>) => void;
  onApplyResources: (sel: Set<string>, mode: MatchMode3) => void;
  onApplyBuildings: (sel: Set<string>, mode: MatchMode3) => void;
  onApplyStatus: (sel: Set<string>) => void;

  onQuickAlliesSelect?: () => string[];
  onQuickHostilesSelect?: () => string[];
};

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_HEIGHT = Math.round(SCREEN_H * 0.6); // 60% pantalla
const ROW_H = 44; // altura consistente
const PILL_H = 36;

// Iconos cabecera
const ICONS = {
  races: "👽",
  resources: "🧪",
  buildings: "🛠️",
  status: "🧭",
};

export default function StarSystemFilterBar({
  raceSel,
  resSel,
  bldSel,
  statusSel,
  resMode,
  bldMode,
  options,
  onApplyRaces,
  onApplyResources,
  onApplyBuildings,
  onApplyStatus,
  onQuickAlliesSelect,
  onQuickHostilesSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("races");

  // Evitar que long-press dispare onPress
  const didLongPress = useRef(false);

  // Estado local (no propagamos hasta Aplicar)
  const [localRace, setLocalRace] = useState<Set<string>>(raceSel);
  const [localRes, setLocalRes] = useState<Set<string>>(resSel);
  const [localBld, setLocalBld] = useState<Set<string>>(bldSel);
  const [localStatus, setLocalStatus] = useState<Set<string>>(statusSel);

  const [localResMode, setLocalResMode] = useState<MatchMode3>(resMode);
  const [localBldMode, setLocalBldMode] = useState<MatchMode3>(bldMode);

  // ==== Helpers de sincronización ====
  const syncLocalsFromProps = () => {
    setLocalRace(new Set(raceSel));
    setLocalRes(new Set(resSel));
    setLocalBld(new Set(bldSel));
    setLocalStatus(new Set(statusSel));
    setLocalResMode(resMode);
    setLocalBldMode(bldMode);
  };

  const cancelAll = () => {
    // descarta cambios locales
    syncLocalsFromProps();
    setOpen(false);
  };

  const applyAll = () => {
    // Aplica TODO lo local de golpe
    onApplyRaces(localRace);
    onApplyResources(localRes, localResMode === "off" && localRes.size > 0 ? "any" : localResMode);
    onApplyBuildings(localBld, localBldMode === "off" && localBld.size > 0 ? "any" : localBldMode);
    onApplyStatus(localStatus);
    setOpen(false);
  };

  // Abrir/cambiar tab desde los iconos de arriba
  const handlePillPress = (tab: TabKey) => {
    if (!open) {
      syncLocalsFromProps(); // inicializa locales desde aplicado
      setActiveTab(tab);
      setOpen(true);
    } else {
      // modal ya abierto -> solo cambia de pestaña (no resetea lo ya marcado)
      setActiveTab(tab);
    }
  };

  // Estado "activo" de cada pill -> SOLO según estado APLICADO (padre)
  const pillsActive = {
    races: raceSel.size > 0,
    resources: resSel.size > 0 && resMode !== "off",
    buildings: bldSel.size > 0 && bldMode !== "off",
    status: statusSel.size > 0,
  };

  // Pill de cabecera
  const Pill = ({
    icon,
    onPress,
    onLongPress,
    active,
  }: {
    icon: string;
    onPress: () => void;
    onLongPress: () => void;
    active: boolean;
  }) => (
    <Pressable
      onPress={() => {
        if (didLongPress.current) {
          didLongPress.current = false;
          return;
        }
        onPress();
      }}
      onLongPress={() => {
        didLongPress.current = true;
        onLongPress();
      }}
      delayLongPress={250}
      style={{
        flex: 1,
        height: PILL_H,
        borderRadius: 10,
        backgroundColor: "#1f1f1f",
        borderWidth: 2,
        borderColor: active ? "#5b8" : "#2a2a2a",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 4,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </Pressable>
  );

  // Limpiar filtros desde long-press (aplica directamente al padre y cierra)
  const clearFilter = (tab: TabKey) => {
    if (tab === "races") onApplyRaces(new Set());
    if (tab === "resources") onApplyResources(new Set(), "off");
    if (tab === "buildings") onApplyBuildings(new Set(), "off");
    if (tab === "status") onApplyStatus(new Set());
    // al limpiar desde fuera, también sincronizamos locales para que al reabrir esté limpio
    syncLocalsFromProps();
    setOpen(false);
  };

  // toggle genérico
  const toggleInSet = (set: Set<string>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  // “Todos” como fila extra (subrayado)
  const AllRow = ({
    allIds,
    sel,
    setSel,
    onAfterToggle,
  }: {
    allIds: string[];
    sel: Set<string>;
    setSel: (s: Set<string>) => void;
    onAfterToggle?: () => void;
  }) => {
    const allChecked = sel.size > 0 && allIds.every((id) => sel.has(id));
    return (
      <Pressable
        onPress={() => {
          const next = allChecked ? new Set<string>() : new Set<string>(allIds);
          setSel(next);
          onAfterToggle?.();
        }}
        style={{
          height: ROW_H,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#2a2a2a",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: allChecked ? "#5b8" : "#555",
            backgroundColor: allChecked ? "#5b8" : "transparent",
          }}
        >
          {allChecked ? <Text style={{ color: "white", fontWeight: "700" }}>✓</Text> : null}
        </View>
        <Text style={{ fontSize: 16, color: "#e6e6e6", textDecorationLine: "underline" }}>
          Todos
        </Text>
      </Pressable>
    );
  };

  const List = ({
    options,
    sel,
    setSel,
    withAllRow,
    onAfterItemToggle,
  }: {
    options: Option[];
    sel: Set<string>;
    setSel: (s: Set<string>) => void;
    withAllRow?: boolean;
    onAfterItemToggle?: () => void;
  }) => {
    const allIds = useMemo(() => options.map((o) => o.id), [options]);
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
          {withAllRow && (
            <AllRow allIds={allIds} sel={sel} setSel={setSel} onAfterToggle={onAfterItemToggle} />
          )}
          {options.map((opt) => {
            const checked = sel.has(opt.id);
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  const next = toggleInSet(sel, opt.id);
                  setSel(next);
                  onAfterItemToggle?.();
                }}
                style={{
                  height: ROW_H,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#2a2a2a",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: checked ? "#5b8" : "#555",
                    backgroundColor: checked ? "#5b8" : "transparent",
                  }}
                >
                  {checked ? <Text style={{ color: "white", fontWeight: "700" }}>✓</Text> : null}
                </View>
                {opt.image ? (
                  <Image
                    source={opt.image}
                    style={{ width: 22, height: 22 }}
                    resizeMode="contain"
                  />
                ) : opt.emoji ? (
                  <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                ) : null}
                <Text style={{ fontSize: 16, color: "#e6e6e6" }}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Segment “Alguno / Todos” (solo resources/buildings) a la derecha del header
  const Segmented = ({
    value,
    onChange,
  }: {
    value: MatchMode3;
    onChange: (m: MatchMode3) => void;
  }) => (
    <View
      style={{
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#2a2a2a",
        borderRadius: 999,
        overflow: "hidden",
        height: PILL_H,
      }}
    >
      {(["any", "all"] as MatchMode3[]).map((m) => {
        const label = m === "any" ? "Alguno" : "Todos";
        const active = value === m;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={{
              paddingHorizontal: 12,
              justifyContent: "center",
              backgroundColor: active ? "#5b8" : "#1f1f1f",
              borderRightWidth: m === "any" ? 1 : 0,
              borderRightColor: "#2a2a2a",
            }}
          >
            <Text style={{ color: active ? "white" : "#e0e0e0" }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  // Aliadas / Hostiles -> reemplazan selección completa
  const AlliesHostiles = () => {
    const allies = onQuickAlliesSelect?.() ?? [];
    const hostiles = onQuickHostilesSelect?.() ?? [];

    const isExactly = (ids: string[]) =>
      ids.length > 0 && ids.every((id) => localRace.has(id)) && localRace.size === ids.length;

    const alliesActive = isExactly(allies);
    const hostilesActive = isExactly(hostiles);

    const btnStyle = (active: boolean) => ({
      paddingHorizontal: 12,
      justifyContent: "center" as const,
      backgroundColor: active ? "#5b8" : "#1f1f1f",
      borderRightWidth: 1,
      borderRightColor: "#2a2a2a",
      height: PILL_H,
    });

    return (
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#2a2a2a",
          borderRadius: 999,
          overflow: "hidden",
          height: PILL_H,
        }}
      >
        <Pressable onPress={() => setLocalRace(new Set(allies))} style={btnStyle(alliesActive)}>
          <Text style={{ color: "white" }}>Aliadas</Text>
        </Pressable>
        <Pressable
          onPress={() => setLocalRace(new Set(hostiles))}
          style={[btnStyle(hostilesActive), { borderRightWidth: 0 }]}
        >
          <Text style={{ color: "white" }}>Hostiles</Text>
        </Pressable>
      </View>
    );
  };

  // auto-pasar a "any" si estaba "off" y seleccionas algo
  const ensureAnyOnSelect = (tab: "resources" | "buildings") => {
    if (tab === "resources" && localResMode === "off") setLocalResMode("any");
    if (tab === "buildings" && localBldMode === "off") setLocalBldMode("any");
  };

  return (
    <>
      {/* Barra superior compacta (iconos) — el padre la posiciona */}
      <View
        style={{
          backgroundColor: "#121212",
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#1f1f1f",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pill
            icon={ICONS.races}
            active={pillsActive.races}
            onPress={() => handlePillPress("races")}
            onLongPress={() => clearFilter("races")}
          />
          <Pill
            icon={ICONS.resources}
            active={pillsActive.resources}
            onPress={() => handlePillPress("resources")}
            onLongPress={() => clearFilter("resources")}
          />
          <Pill
            icon={ICONS.buildings}
            active={pillsActive.buildings}
            onPress={() => handlePillPress("buildings")}
            onLongPress={() => clearFilter("buildings")}
          />
          <Pill
            icon={ICONS.status}
            active={pillsActive.status}
            onPress={() => handlePillPress("status")}
            onLongPress={() => clearFilter("status")}
          />
        </View>
      </View>

      {/* Bottom sheet modal (overlay TRANSPARENTE, tap fuera cancela TODO) */}
      <Modal transparent animationType="slide" visible={open} onRequestClose={cancelAll}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable onPress={cancelAll} style={{ flex: 1, backgroundColor: "transparent" }} />

          <View
            style={{
              backgroundColor: "#1a1a1a",
              padding: 12,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
              borderColor: "#2a2a2a",
              height: SHEET_HEIGHT, // 60% pantalla
            }}
          >
            {/* Tabs + (derecha) segmentos */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
                {(
                  [
                    ["races", ICONS.races],
                    ["resources", ICONS.resources],
                    ["buildings", ICONS.buildings],
                    ["status", ICONS.status],
                  ] as [TabKey, string][]
                ).map(([k, ic]) => {
                  const active = activeTab === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setActiveTab(k as TabKey)}
                      style={{
                        paddingHorizontal: 10,
                        height: PILL_H,
                        borderRadius: 999,
                        backgroundColor: active ? "#5b8" : "#2a2a2a",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: active ? "white" : "#e6e6e6" }}>{ic}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* derecha */}
              {activeTab === "resources" && (
                <Segmented
                  value={localResMode === "off" ? "any" : localResMode}
                  onChange={(m) => setLocalResMode(m)}
                />
              )}
              {activeTab === "buildings" && (
                <Segmented
                  value={localBldMode === "off" ? "any" : localBldMode}
                  onChange={(m) => setLocalBldMode(m)}
                />
              )}
              {activeTab === "races" && <AlliesHostiles />}
            </View>

            {/* Contenido (listas siempre ocupan el alto disponible) */}
            {activeTab === "races" && (
              <View style={{ flex: 1 }}>
                <List options={options.races} sel={localRace} setSel={setLocalRace} withAllRow />
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                  <Pressable
                    onPress={cancelAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#2a2a2a",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "#e6e6e6", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={applyAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#5b8",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>
                      Aplicar
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {activeTab === "resources" && (
              <View style={{ flex: 1 }}>
                <List
                  options={options.resources}
                  sel={localRes}
                  setSel={(s) => setLocalRes(s)}
                  withAllRow
                  onAfterItemToggle={() => ensureAnyOnSelect("resources")}
                />
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                  <Pressable
                    onPress={cancelAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#2a2a2a",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "#e6e6e6", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={applyAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#5b8",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>
                      Aplicar
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {activeTab === "buildings" && (
              <View style={{ flex: 1 }}>
                <List
                  options={options.buildings}
                  sel={localBld}
                  setSel={(s) => setLocalBld(s)}
                  withAllRow
                  onAfterItemToggle={() => ensureAnyOnSelect("buildings")}
                />
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                  <Pressable
                    onPress={cancelAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#2a2a2a",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "#e6e6e6", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={applyAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#5b8",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>
                      Aplicar
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {activeTab === "status" && (
              <View style={{ flex: 1 }}>
                <List
                  options={options.status}
                  sel={localStatus}
                  setSel={setLocalStatus}
                  withAllRow
                />
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                  <Pressable
                    onPress={cancelAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#2a2a2a",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "#e6e6e6", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={applyAll}
                    style={{
                      flex: 1,
                      height: ROW_H,
                      borderRadius: 10,
                      backgroundColor: "#5b8",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>
                      Aplicar
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
