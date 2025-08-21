import { raceConfig } from "@/src/config/raceConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { Ship } from "@/src/types/shipType";
import { getCfg } from "@/utils/generalUtils";
import { getDistance, getSpecByType, isCustomType } from "@/utils/shipUtils";
import { getSystemImage } from "@/utils/starSystemUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import CustomPicker from "./CustomPicker";

type Props = {
  origin: string;
  destination: string;
};

export default function FleetSelector({ origin, destination }: Props) {
  // --- Origen/destino locales para poder hacer swap ---
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [currentDestination, setCurrentDestination] = useState(destination);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState<Record<string, number>>({});
  const [existingAtDestination, setExistingAtDestination] = useState<Record<string, number>>({});

  // Modal defensas
  const [showDefenseModal, setShowDefenseModal] = useState(false);

  const router = useRouter();
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const starSystems = useGameContextSelector((ctx) => ctx.starSystems);
  const specs = useGameContextSelector((ctx) => ctx.specs);
  const universe = useGameContextSelector((ctx) => ctx.universe);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const startAttack = useGameContextSelector((ctx) => ctx.startAttack);
  const startFleetMovement = useGameContextSelector((ctx) => ctx.startFleetMovement);

  const baseName = getCfg(playerConfig, "PLANET_NAME")!;
  const startingSystem = getCfg(playerConfig, "STARTING_SYSTEM")!;

  const starSystemsWithFleet = starSystems.filter(
    (ss) => !ss.discarded && ss.playerShips && ss.playerShips.length > 0
  );

  // Helpers para localizar sistemas
  const findSystem = useCallback(
    (id: string | undefined) => (id ? starSystems.find((s) => s.id === id) : undefined),
    [starSystems]
  );

  // --- Naves del ORIGEN ---
  const getOriginShips = useCallback(
    (originId: string): Ship[] => {
      if (originId === "PLANET") return shipBuildQueue;
      const sys = findSystem(originId);
      const arr = (sys as any)?.playerShips || [];
      return Array.isArray(arr) ? arr : [];
    },
    [shipBuildQueue, findSystem]
  );

  // --- Naves existentes en DESTINO (para movimiento) ---
  const getDestinationShips = useCallback(
    (destId: string): Ship[] => {
      if (destId === "PLANET") return shipBuildQueue;
      const sys = findSystem(destId);
      const arr = (sys as any)?.playerShips || [];
      return Array.isArray(arr) ? arr : [];
    },
    [shipBuildQueue, findSystem]
  );

  // --- Defensas del sistema (solo ataque) ---
  const getDefenseShips = useCallback(
    (destId: string): Ship[] => {
      if (destId === "PLANET") return [];
      const sys = findSystem(destId);
      const arr = (sys as any)?.defense ?? (sys as any)?.defensa ?? [];
      return Array.isArray(arr) ? arr : [];
    },
    [findSystem]
  );

  const systemOrigin: ReturnType<typeof findSystem> = React.useMemo(
    () => findSystem(currentOrigin),
    [currentOrigin, findSystem]
  );
  const systemDest = useMemo(
    () => (currentDestination === "PLANET" ? undefined : findSystem(currentDestination)),
    [currentDestination, findSystem]
  );

  const destinationName =
    currentDestination === "PLANET" ? baseName : systemDest ? universe[systemDest.id].name : "";
  const isAttack = currentDestination !== "PLANET" && !!systemDest?.race;

  // Imágenes
  const originImage =
    currentOrigin === "PLANET"
      ? IMAGES.BACKGROUND_MENU_IMAGE
      : systemOrigin
      ? getSystemImage(systemOrigin.type)
      : IMAGES.BACKGROUND_MENU_IMAGE;

  const destinationImage = !systemDest
    ? IMAGES.BACKGROUND_MENU_IMAGE
    : systemDest.id === "PLANET"
    ? IMAGES.BACKGROUND_MENU_IMAGE
    : getSystemImage(systemDest.type);

  const hasAvailable = useMemo(() => Object.values(available).some((v) => v > 0), [available]);
  const hasSelectedAll = useMemo(() => Object.values(selected).some((v) => v > 0), [selected]);

  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");

  // --- Re-carga ambos lados (origen/destino) ---
  const reloadSides = useCallback(
    (originId: string, destId: string) => {
      setSelected({});

      const originShips = getOriginShips(originId);
      const initialAvailable = originShips.reduce((acc, f) => {
        const amt = Number(f.amount) || 0;
        if (amt > 0) acc[f.type] = (acc[f.type] || 0) + amt;
        return acc;
      }, {} as Record<string, number>);
      setAvailable(initialAvailable);

      const destShips = getDestinationShips(destId);
      const initialExisting = destShips.reduce((acc, f) => {
        const amt = Number(f.amount) || 0;
        if (amt > 0) acc[f.type] = (acc[f.type] || 0) + amt;
        return acc;
      }, {} as Record<string, number>);
      setExistingAtDestination(initialExisting);
    },
    [getOriginShips, getDestinationShips]
  );

  useFocusEffect(
    React.useCallback(() => {
      reloadSides(currentOrigin, currentDestination);
    }, [currentOrigin, currentDestination, reloadSides])
  );

  // --- ACCIONES ---
  const sendAttack = (selectedFleets: Ship[]) => {
    if (selectedFleets.length > 0) {
      if (!systemDest) return;

      const race = systemDest.race;
      if (race) {
        const raceName = raceConfig[race].name;
        Alert.alert(
          "Diplomacia",
          "Estás seguro que quieres atacar a los " +
            raceName +
            ". El ataque empeorará nuestra relación con ellos.",
          [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("confirm"),
              onPress: async () => {
                startAttack(currentDestination, selectedFleets, currentOrigin);
                router.replace("/(tabs)/galaxy");
              },
            },
          ]
        );
      } else {
        startAttack(currentDestination, selectedFleets, currentOrigin);
        router.replace("/(tabs)/galaxy");
      }
    } else {
      Toast.show({
        type: "info",
        text1: "No se puede enviar una flota vacía",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const moveFleet = (selectedFleets: Ship[]) => {
    if (selectedFleets.length > 0) {
      if (currentDestination !== "PLANET" && !systemDest) return;

      Alert.alert("Movimiento", "¿Estás seguro de que quieres enviar las flotas a este sistema? ", [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: async () => {
            startFleetMovement(currentOrigin, currentDestination, selectedFleets);
            router.replace("/(tabs)/galaxy");
          },
        },
      ]);
    } else {
      Toast.show({
        type: "info",
        text1: "No se puede enviar una flota vacía",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  // ORIGEN -> seleccionar/añadir
  const onPressOrigin = (fleetId: string) => {
    if ((available[fleetId] ?? 0) > 0) {
      setAvailable((prev) => ({ ...prev, [fleetId]: prev[fleetId] - 1 }));
      setSelected((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + 1 }));
    }
  };
  const onLongPressOrigin = (fleetId: string) => {
    if ((available[fleetId] ?? 0) > 0) {
      const amountToMove = available[fleetId];
      setAvailable((prev) => ({ ...prev, [fleetId]: 0 }));
      setSelected((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + amountToMove }));
    }
  };

  // DESTINO -> quitar añadidas
  const onPressDestination = (fleetId: string) => {
    if ((selected[fleetId] ?? 0) > 0) {
      setSelected((prev) => {
        const next = { ...prev, [fleetId]: prev[fleetId] - 1 };
        if (next[fleetId] <= 0) delete next[fleetId];
        return next;
      });
      setAvailable((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + 1 }));
    }
  };
  const onLongPressDestination = (fleetId: string) => {
    const add = selected[fleetId] ?? 0;
    if (add > 0) {
      setSelected((prev) => {
        const next = { ...prev };
        delete next[fleetId];
        return next;
      });
      setAvailable((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + add }));
    }
  };

  const onCancel = () => {
    router.replace("/(tabs)/galaxy");
  };

  const onLongPressOriginZone = () => {
    if (!Object.keys(available).length) return;
    setSelected((prev) => {
      const next = { ...prev };
      Object.entries(available).forEach(([type, amt]) => {
        if ((amt ?? 0) > 0) next[type] = (next[type] || 0) + (amt || 0);
      });
      return next;
    });
    setAvailable({});
  };

  const onLongPressDestinationZone = () => {
    if (!Object.keys(selected).length) return;
    setAvailable((prev) => {
      const next = { ...prev };
      Object.entries(selected).forEach(([type, amt]) => {
        if ((amt ?? 0) > 0) next[type] = (next[type] || 0) + (amt || 0);
      });
      return next;
    });
    setSelected({});
  };

  // --- SWAP ---
  const onSwap = () => {
    const newOrigin = currentDestination;
    const newDestination = currentOrigin;
    setCurrentOrigin(newOrigin);
    setCurrentDestination(newDestination);
    reloadSides(newOrigin, newDestination);
  };

  // Lista de naves presentes en ORIGEN
  const originShipsList = useMemo(
    () => getOriginShips(currentOrigin),
    [getOriginShips, currentOrigin]
  );

  // ORIGEN (solo disponibles > 0)
  const originFleets = originShipsList.filter((f) => (available[f.type] ?? 0) > 0);

  // Template por tipo (incluye defensas para tener imágenes/nombres)
  const typeToShipTemplate: Record<string, Ship> = useMemo(() => {
    const map: Record<string, Ship> = {};
    [
      ...originShipsList,
      ...getDestinationShips(currentDestination),
      ...getDefenseShips(currentDestination),
    ].forEach((f) => (map[f.type] = f));
    return map;
  }, [originShipsList, getDestinationShips, getDefenseShips, currentDestination]);

  // MOVIMIENTO: conjunto tipos en destino
  const destinationTypes = useMemo(() => {
    const set = new Set<string>(Object.keys(existingAtDestination));
    Object.keys(selected).forEach((k) => set.add(k));
    return Array.from(set);
  }, [existingAtDestination, selected]);

  // MOVIMIENTO: combinado base+añadidas
  type DestRow = { type: string; base: number; added: number; ship: Ship };
  const destinationCombined: DestRow[] = useMemo(() => {
    return destinationTypes.map((type) => ({
      type,
      base: existingAtDestination[type] ?? 0,
      added: selected[type] ?? 0,
      ship: typeToShipTemplate[type] ?? ({ type, amount: 0 } as Ship),
    }));
  }, [destinationTypes, existingAtDestination, selected, typeToShipTemplate]);

  // ATAQUE: defensas agregadas y atacantes (solo seleccionadas)
  const defenseMap: Record<string, number> = useMemo(() => {
    const acc: Record<string, number> = {};
    if (!isAttack) return acc;
    const defenseShipsList = getDefenseShips(currentDestination);
    defenseShipsList.forEach((f) => {
      const amt = Number(f.amount) || 0;
      if (amt > 0) acc[f.type] = (acc[f.type] || 0) + amt;
    });
    return acc;
  }, [isAttack, getDefenseShips, currentDestination]);

  const defenseCombined: DestRow[] = useMemo(() => {
    return Object.keys(defenseMap).map((type) => ({
      type,
      base: defenseMap[type] ?? 0,
      added: 0,
      ship: typeToShipTemplate[type] ?? ({ type, amount: 0 } as Ship),
    }));
  }, [defenseMap, typeToShipTemplate]);

  const totalDefense = useMemo(
    () => Object.values(defenseMap).reduce((a, b) => a + b, 0),
    [defenseMap]
  );

  const attackerCombined: DestRow[] = useMemo(() => {
    if (!isAttack) return [];
    return Object.keys(selected).map((type) => ({
      type,
      base: 0,
      added: selected[type] ?? 0,
      ship: typeToShipTemplate[type] ?? ({ type, amount: 0 } as Ship),
    }));
  }, [isAttack, selected, typeToShipTemplate]);

  // --- Render items ---
  const renderFleetItem = (
    item: Ship,
    base: number,
    added: number,
    onPress: (id: string) => void,
    onLongPress: (id: string) => void,
    options?: { borderColor?: string; badgeColorBase?: string; badgeColorAdded?: string }
  ) => {
    const spec = getSpecByType(item.type, specs);
    const image = spec?.imageBackground ?? IMAGES.BACKGROUND_MENU_IMAGE;

    const onlyBase = base > 0 && added === 0; // gris + no interactivo
    const interactive = added > 0;
    const shipName = isCustomType(item.type) ? spec?.name : tShip(`shipName.${item.type}`);

    return (
      <TouchableOpacity
        style={styles.fleetItem}
        onPress={interactive ? () => onPress(item.type) : undefined}
        onLongPress={interactive ? () => onLongPress(item.type) : undefined}
        activeOpacity={1}
      >
        <View
          style={[
            styles.imageWrapper,
            {
              borderColor: onlyBase
                ? options?.borderColor || "#9ca3af"
                : options?.borderColor || "#b5fff6ff",
            },
          ]}
        >
          <Image source={image} style={styles.fleetImage} />
          {onlyBase && <View pointerEvents="none" style={styles.dimOverlay} />}
        </View>

        <Text style={styles.fleetName}>{shipName}</Text>

        {base > 0 ? (
          <View
            style={[
              styles.quantityBadge,
              { backgroundColor: options?.badgeColorBase ?? "#ffffff" },
            ]}
          >
            <Text style={styles.quantityText}>{base}</Text>
          </View>
        ) : added > 0 ? (
          <View
            style={[
              styles.quantityBadge,
              { backgroundColor: options?.badgeColorAdded ?? "#00ff90" },
            ]}
          >
            <Text style={styles.quantityText}>{added}</Text>
          </View>
        ) : null}

        {base > 0 && added > 0 && (
          <View style={styles.plusBadge}>
            <Text style={styles.plusBadgeText}>+{added}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const distanceBase = getDistance(starSystems, startingSystem, currentDestination);
  const items = [
    { label: `${t("From")} ${baseName} (${distanceBase} parsecs)`, value: "PLANET" },
    ...starSystemsWithFleet
      .map((s) => {
        const distance = getDistance(starSystems, s.id, currentDestination);
        const label = `${t("From")} ${universe[s.id].name} (${distance} parsecs)`;
        return { label, value: s.id, distance };
      })
      .sort((a, b) => a.distance - b.distance),
  ];

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 8 }}>
        <CustomPicker
          selectedValue={currentOrigin}
          items={items}
          onValueChange={(value) => setCurrentOrigin(value)}
        />
      </View>

      {/* ORIGEN */}
      <ImageBackground
        source={originImage}
        style={styles.fleetBox}
        imageStyle={[styles.fleetBoxImage, styles.fleetBoxImageDim]}
      >
        <FlatList
          data={originFleets}
          keyExtractor={(item) => `origin-${currentOrigin}-${item.type}`}
          numColumns={4}
          contentContainerStyle={[styles.listContainer, styles.listFill]}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) =>
            renderFleetItem(item, 0, available[item.type] ?? 0, onPressOrigin, onLongPressOrigin)
          }
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 6 }}>
              No hay naves en el sistema
            </Text>
          }
          extraData={available}
        />
        <View pointerEvents="box-none" style={styles.bulkActionOrigin}>
          <TouchableOpacity
            onPress={onLongPressOriginZone}
            disabled={!hasAvailable}
            style={[styles.bulkBtn, !hasAvailable && styles.bulkBtnDisabled]}
            accessibilityLabel={t("MoveAll")}
          >
            <Ionicons name="arrow-down-circle" size={16} color="#000" />
            <Text style={styles.bulkBtnText}>{t("MoveAll")}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Controles */}

      <View style={{ justifyContent: "space-between", flexDirection: "row", padding: 5 }}>
        <TouchableOpacity style={commonStyles.cancelButton} onPress={onCancel}>
          <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
        </TouchableOpacity>
        {isAttack ? (
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-down" size={20} color="#ff6b6b" />
            <Ionicons name="arrow-down" size={20} color="#ff6b6b" />
            <Text style={styles.arrowText}>{t("Attack")}</Text>
            <Ionicons name="arrow-down" size={20} color="#ff6b6b" />
            <Ionicons name="arrow-down" size={20} color="#ff6b6b" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={onSwap}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
            <Ionicons name="arrow-up" size={20} color="#00ffe0" />
            <Text style={styles.arrowText}>{t("Change")}</Text>
            <Ionicons name="arrow-up" size={20} color="#00ffe0" />
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={commonStyles.buttonPrimary}
          onPress={() => {
            const originShips = getOriginShips(currentOrigin);
            const selectedFleets = originShips
              .filter((f) => (selected[f.type] ?? 0) > 0)
              .map((f) => ({ ...f, amount: selected[f.type] }));
            if (isAttack) {
              sendAttack(selectedFleets);
            } else {
              moveFleet(selectedFleets);
            }
          }}
        >
          <Text style={commonStyles.buttonTextLight}>{t("Confirm")}</Text>
        </TouchableOpacity>
      </View>

      {/* DESTINO */}
      <ImageBackground
        source={destinationImage}
        style={styles.fleetBox}
        imageStyle={[styles.fleetBoxImage, styles.fleetBoxImageDim]}
      >
        {isAttack ? (
          <>
            {/* Botón flotante "Defensas (N)" — a la derecha y tamaño igual a 'Mover todo'/'Limpiar' */}
            <View style={styles.floatingDefenseBtnWrapper} pointerEvents="box-none">
              <TouchableOpacity
                onPress={() => setShowDefenseModal(true)}
                style={styles.floatingDefenseBtn}
                accessibilityLabel="Ver defensas"
              >
                <Ionicons name="shield" size={16} color="#000" />
                <Text style={styles.floatingDefenseBtnText}>{`Defensas (${totalDefense})`}</Text>
              </TouchableOpacity>
            </View>

            {/* Solo tus naves asignadas al ataque */}
            <FlatList
              data={attackerCombined}
              keyExtractor={(row) => `atk-${currentDestination}-${row.type}`}
              numColumns={4}
              contentContainerStyle={[styles.listContainer, styles.listFill]}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: row }) =>
                renderFleetItem(
                  row.ship,
                  0,
                  row.added,
                  onPressDestination,
                  onLongPressDestination,
                  {
                    badgeColorAdded: "#00ff90",
                  }
                )
              }
              extraData={{ selected }}
              ListEmptyComponent={
                <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 6 }}>
                  Añade naves para atacar
                </Text>
              }
            />
          </>
        ) : (
          // --- Movimiento: combinado base + añadidas ---
          <FlatList
            data={destinationCombined}
            keyExtractor={(row) => `dest-${currentDestination}-${row.type}`}
            numColumns={4}
            contentContainerStyle={[styles.listContainer, styles.listFill]}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: row }) =>
              renderFleetItem(
                row.ship,
                row.base,
                row.added,
                onPressDestination,
                onLongPressDestination
              )
            }
            extraData={{ existingAtDestination, selected }}
            ListEmptyComponent={
              <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 6 }}>
                No hay naves en el sistema
              </Text>
            }
          />
        )}

        {/* Botón limpiar SOLO tus seleccionadas */}
        <View pointerEvents="box-none" style={styles.bulkActionDest}>
          <TouchableOpacity
            onPress={onLongPressDestinationZone}
            disabled={!hasSelectedAll}
            style={[styles.bulkBtn, !hasSelectedAll && styles.bulkBtnDisabled]}
            accessibilityLabel={t("ClearAll")}
          >
            <Ionicons name="arrow-up-circle" size={16} color="#000" />
            <Text style={styles.bulkBtnText}>{t("ClearAll")}</Text>
          </TouchableOpacity>
        </View>

        <View pointerEvents="none" style={styles.destFooter}>
          <Text style={styles.destFooterText}>{destinationName}</Text>
        </View>
      </ImageBackground>

      {/* MODAL: detalle de defensas (más alto, 4 columnas, con scroll) */}
      <Modal
        visible={showDefenseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDefenseModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDefenseModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="shield" size={18} color="#ff6b6b" />
                <Text style={styles.modalTitle}>{`Defensas (${totalDefense})`}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDefenseModal(false)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <FlatList
                data={defenseCombined}
                keyExtractor={(row) => `def-modal-${currentDestination}-${row.type}`}
                numColumns={4} // 4 columnas
                contentContainerStyle={[styles.listContainer, { paddingBottom: 12 }]}
                renderItem={({ item: row }) =>
                  renderFleetItem(
                    row.ship,
                    row.base,
                    0,
                    () => {},
                    () => {},
                    {
                      borderColor: "#ff6b6b",
                      badgeColorBase: "#ffffff",
                    }
                  )
                }
                ListEmptyComponent={
                  <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 6 }}>
                    Sin defensas detectadas
                  </Text>
                }
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 5 },

  // cajas
  fleetBox: {
    borderRadius: 12,
    flex: 0.5,
    borderWidth: 2,
    borderColor: "white",
  },
  fleetBoxImage: { borderRadius: 12 },
  fleetBoxImageDim: { opacity: 0.7 },
  listContainer: { paddingHorizontal: 4 },
  listFill: { minHeight: "100%" },

  // items
  fleetItem: { flex: 1 / 4, marginHorizontal: 8, alignItems: "center" },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#b5fff6ff",
    position: "relative",
  },
  fleetImage: { width: "100%", height: "100%", resizeMode: "cover" },
  dimOverlay: {
    position: "absolute",
    inset: 0 as any,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1,
  },
  fleetName: { color: "#ffffffff", fontWeight: "600", fontSize: 14, textAlign: "center" },

  quantityBadge: {
    position: "absolute",
    top: 6,
    right: 2,
    backgroundColor: "#00ff90",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    zIndex: 2,
  },
  plusBadge: {
    position: "absolute",
    top: 6,
    right: 52,
    backgroundColor: "#00ff90",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    zIndex: 2,
  },
  quantityText: { color: "#000", fontWeight: "bold", fontSize: 12 },
  plusBadgeText: { color: "#000", fontWeight: "bold", fontSize: 11 },

  // bulk buttons
  bulkActionOrigin: { position: "absolute", right: 8, bottom: 8, zIndex: 4 },
  bulkActionDest: { position: "absolute", right: 8, bottom: 8, zIndex: 4 },
  bulkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6 as any,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#0091ffff",
  },
  bulkBtnDisabled: { opacity: 0.4 },
  bulkBtnText: { color: "#000", fontWeight: "700", fontSize: 12 },

  // centro
  arrowContainer: { alignItems: "center", flexDirection: "row" },

  // pie destino
  destFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: "center",
    zIndex: 3,
  },
  destFooterText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // botón flotante defensas (derecha, mismo tamaño que bulkBtn)
  floatingDefenseBtnWrapper: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 5,
    alignItems: "flex-end",
  },
  floatingDefenseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6 as any,
    paddingHorizontal: 10, // igual que bulkBtn
    paddingVertical: 6, // igual que bulkBtn
    borderRadius: 12, // igual que bulkBtn
    backgroundColor: "#ffd166",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  floatingDefenseBtnText: { color: "#000", fontWeight: "700", fontSize: 12 }, // igual que bulkBtnText

  // modal defensas (más alto para 3 filas, con scroll si hay 4+)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // desde abajo, estilo hoja
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#101214",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { color: "#fff", fontWeight: "800", fontSize: 15, marginLeft: 8 },
  modalBody: {
    maxHeight: "85%",
    paddingVertical: 8,
  },
  arrowText: { color: "#00ffe0", fontSize: 14, paddingHorizontal: 15 },
});
