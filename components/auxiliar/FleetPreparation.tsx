import { raceConfig } from "@/src/config/raceConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { Ship } from "@/src/types/shipType";
import { getCfg } from "@/utils/generalUtils";
import { getDistance, getSpecByType } from "@/utils/shipUtils";
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
  // --- NUEVO: origen/destino controlados localmente para poder hacer swap ---
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [currentDestination, setCurrentDestination] = useState(destination);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState<Record<string, number>>({});
  const [existingAtDestination, setExistingAtDestination] = useState<Record<string, number>>({});

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

  // --- De dónde salen las naves del ORIGEN ---
  const getOriginShips = useCallback(
    (originId: string): Ship[] => {
      if (originId === "PLANET") {
        // Igual que tu implementación original: el origen PLANET usa la cola/stock del jugador
        return shipBuildQueue;
      }
      // Si el origen es un sistema, tomamos sus naves del jugador (ajusta la propiedad si tu modelo es distinto)
      const sys = findSystem(originId);
      const arr = (sys as any)?.playerShips || [];
      return Array.isArray(arr) ? arr : [];
    },
    [shipBuildQueue, findSystem]
  );

  // --- De dónde salen las naves EXISTENTES en el DESTINO ---
  const getDestinationShips = useCallback(
    (destId: string): Ship[] => {
      if (destId === "PLANET") {
        // Igual que tu implementación original: el origen PLANET usa la cola/stock del jugador
        return shipBuildQueue;
      }
      // Si el origen es un sistema, tomamos sus naves del jugador (ajusta la propiedad si tu modelo es distinto)
      const sys = findSystem(destId);
      const arr = (sys as any)?.playerShips || [];
      return Array.isArray(arr) ? arr : [];
    },
    [shipBuildQueue, findSystem]
  );

  // Sistema destino actual (para imagen y si es ataque)
  const systemDest = findSystem(currentDestination);
  const isAttack = currentDestination != "PLANET" && !!systemDest?.race;

  // Imágenes
  const originImage =
    currentOrigin === "PLANET" ? IMAGES.BACKGROUND_MENU_IMAGE : IMAGES.BACKGROUND_MENU_IMAGE;
  const destinationImage = !systemDest
    ? IMAGES.BACKGROUND_MENU_IMAGE
    : systemDest.id === "PLANET"
    ? IMAGES.BACKGROUND_MENU_IMAGE
    : getSystemImage(systemDest.type);

  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");

  // --- Re-carga ambos lados (origen/destino) ---
  const reloadSides = useCallback(
    (originId: string, destId: string) => {
      setSelected({});

      const originShips = getOriginShips(originId);
      const initialAvailable = originShips.reduce((acc, f) => {
        const amt = Number(f.amount) || 0;
        if (amt > 0) acc[f.type] = (acc[f.type] || 0) + amt; // 👈 solo >0
        return acc;
      }, {} as Record<string, number>);
      setAvailable(initialAvailable);

      const destShips = getDestinationShips(destId);
      const initialExisting = destShips.reduce((acc, f) => {
        const amt = Number(f.amount) || 0;
        if (amt > 0) acc[f.type] = (acc[f.type] || 0) + amt; // 👈 solo >0
        return acc;
      }, {} as Record<string, number>);
      setExistingAtDestination(initialExisting);
    },
    [getOriginShips, getDestinationShips]
  );

  // Cargar al enfocar y cada vez que cambien ids actuales
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
      if (currentDestination != "PLANET" && !systemDest) return;

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
    // si no hay nada, no hacer trabajo
    if (!Object.keys(available).length) return;
    setSelected((prev) => {
      const next = { ...prev };
      Object.entries(available).forEach(([type, amt]) => {
        if ((amt ?? 0) > 0) next[type] = (next[type] || 0) + (amt || 0);
      });
      return next;
    });
    setAvailable({}); // todo movido
  };

  // Long press en el área de DESTINO: quitar TODO
  const onLongPressDestinationZone = () => {
    if (!Object.keys(selected).length) return;
    setAvailable((prev) => {
      const next = { ...prev };
      Object.entries(selected).forEach(([type, amt]) => {
        if ((amt ?? 0) > 0) next[type] = (next[type] || 0) + (amt || 0);
      });
      return next;
    });
    setSelected({}); // todo devuelto
  };

  // --- SWAP handler ---
  const onSwap = () => {
    const newOrigin = currentDestination;
    const newDestination = currentOrigin;
    setCurrentOrigin(newOrigin);
    setCurrentDestination(newDestination);
    // recalcula inmediatamente con los nuevos ids
    reloadSides(newOrigin, newDestination);
  };

  // Lista de naves presentes en ORIGEN (para pintar arriba)
  const originShipsList = useMemo(
    () => getOriginShips(currentOrigin),
    [getOriginShips, currentOrigin]
  );

  // Data para el ORIGEN (solo se muestran las que tienen disponible > 0)
  const originFleets = originShipsList.filter((f) => (available[f.type] ?? 0) > 0);

  // Mapa de templates para imágenes/nombres (usa origen + destino por si hay tipos solo en destino)
  const typeToShipTemplate: Record<string, Ship> = useMemo(() => {
    const map: Record<string, Ship> = {};
    [...originShipsList, ...getDestinationShips(currentDestination)].forEach(
      (f) => (map[f.type] = f)
    );
    return map;
  }, [originShipsList, getDestinationShips, currentDestination]);

  // Conjunto de tipos presentes en destino (existentes o añadidos)
  const destinationTypes = useMemo(() => {
    const set = new Set<string>(Object.keys(existingAtDestination));
    Object.keys(selected).forEach((k) => set.add(k));
    return Array.from(set);
  }, [existingAtDestination, selected]);

  // Combinar destino: base + añadidas
  type DestRow = { type: string; base: number; added: number; ship: Ship };
  const destinationCombined: DestRow[] = useMemo(() => {
    return destinationTypes.map((type) => ({
      type,
      base: existingAtDestination[type] ?? 0,
      added: selected[type] ?? 0,
      ship: typeToShipTemplate[type] ?? ({ type, amount: 0 } as Ship),
    }));
  }, [destinationTypes, existingAtDestination, selected, typeToShipTemplate]);

  // Render item (mismas reglas visuales que ya tenías)
  const renderFleetItem = (
    item: Ship,
    base: number,
    added: number,
    onPress: (id: string) => void,
    onLongPress: (id: string) => void
  ) => {
    const spec = getSpecByType(item.type, specs);
    const image = spec?.imageBackground ?? IMAGES.BACKGROUND_MENU_IMAGE;

    const onlyBase = base > 0 && added === 0; // gris + no interactivo
    const interactive = added > 0;

    return (
      <TouchableOpacity
        style={styles.fleetItem} // 👈 quitamos el onlyBase && { opacity: 0.55 }
        onPress={interactive ? () => onPress(item.type) : undefined}
        onLongPress={interactive ? () => onLongPress(item.type) : undefined}
        activeOpacity={1}
      >
        <View
          style={[
            styles.imageWrapper,
            onlyBase ? { borderColor: "#9ca3af" } : { borderColor: "#b5fff6ff" },
          ]}
        >
          <Image source={image} style={styles.fleetImage} />
          {onlyBase && <View pointerEvents="none" style={styles.dimOverlay} />}
          {/* 👆 oscurece la imagen, NO los badges */}
        </View>

        <Text style={styles.fleetName}>{tShip(`shipName.${item.type}`)}</Text>

        {base > 0 ? (
          <View style={[styles.quantityBadge, onlyBase && { backgroundColor: "#ffffff" }]}>
            <Text style={styles.quantityText}>{base}</Text>
          </View>
        ) : added > 0 ? (
          <View style={[styles.quantityBadge, { backgroundColor: "#00ff90" }]}>
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
        <Pressable
          style={[styles.box, styles.boxFill]}
          onLongPress={onLongPressOriginZone}
          delayLongPress={350}
        >
          <FlatList
            pointerEvents="box-none"
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
        </Pressable>
      </ImageBackground>

      {/* CONTROLES */}
      <View style={{ justifyContent: "space-between", flexDirection: "row", padding: 5 }}>
        <TouchableOpacity style={commonStyles.cancelButton} onPress={onCancel}>
          <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
        </TouchableOpacity>

        {/* --- BOTÓN SWAP --- */}

        {isAttack ? (
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
            <Text style={styles.arrowText}>{t("Attack")}</Text>
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
            <Ionicons name="arrow-down" size={20} color="#00ffe0" />
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
            // Construimos las seleccionadas a partir de las del ORIGEN actual
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

      {/* DESTINO (lista única combinada) */}
      <ImageBackground
        source={destinationImage}
        style={styles.fleetBox}
        imageStyle={[styles.fleetBoxImage, styles.fleetBoxImageDim]}
      >
        <Pressable
          style={[styles.box, styles.boxFill]}
          onLongPress={onLongPressDestinationZone}
          delayLongPress={350}
        >
          <FlatList
            pointerEvents="box-none"
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
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#b5fff6ff",
    position: "relative", // 👈 necesario para overlay/badges
  },
  fleetImage: { width: "100%", height: "100%", resizeMode: "cover" },

  // Capa que oscurece SOLO la imagen cuando es "solo base"
  dimOverlay: {
    position: "absolute",
    inset: 0 as any, // RN 0.73+; si no, usa top/left/right/bottom: 0
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1,
  },

  // Badges por encima del overlay (opacos)
  quantityBadge: {
    position: "absolute",
    top: 6,
    right: 2, // ajusta si quieres más a la derecha (antes 14)
    backgroundColor: "#00ff90", // verde opaco
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    zIndex: 2, // 👈 por encima del overlay
  },
  plusBadge: {
    position: "absolute",
    top: 6,
    right: 52, // 2 + 50; ajusta junto con quantityBadge.right
    backgroundColor: "#00ff90", // verde opaco
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    zIndex: 2, // 👈 por encima del overlay
  },
  quantityText: { color: "#000", fontWeight: "bold", fontSize: 12 },
  fleetBox: {
    borderRadius: 12,
    flex: 0.5,
    borderWidth: 2,
    borderColor: "white",
    // ❌ elimina: opacity: 0.7
  },
  fleetBoxImage: {
    borderRadius: 12,
  },
  // ✅ nueva: solo la imagen de fondo tiene opacidad
  fleetBoxImageDim: {
    opacity: 0.7,
  },
  boxFill: { flex: 1 }, // el Pressable llena la caja
  listFill: { minHeight: "100%" },
  container: { flex: 1, backgroundColor: "#000", padding: 5 },
  arrowContainer: { alignItems: "center", flexDirection: "row" },
  arrowText: { color: "#00ffe0", fontSize: 14, paddingHorizontal: 15 },
  box: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    minHeight: 120,
  },
  listContainer: { paddingHorizontal: 4 },
  fleetItem: { flex: 1 / 4, marginHorizontal: 8, alignItems: "center" },
  fleetName: { color: "#ffffffff", fontWeight: "600", fontSize: 14, textAlign: "center" },

  plusBadgeText: { color: "#000", fontWeight: "bold", fontSize: 11 },
});
