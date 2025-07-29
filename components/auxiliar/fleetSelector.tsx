import { commonStyles } from "@/src/styles/commonStyles";
import { Ship } from "@/src/types/shipType";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { shipConfig } from "../../src/config/shipConfig";

type Props = {
  fleets: Ship[];
  onConfirm: (selectedFleets: Ship[]) => void;
  onCancel: () => void;
  originImage: ImageSourcePropType;
  destinationImage: ImageSourcePropType;
};

export default function FleetSelector({
  fleets,
  onConfirm,
  onCancel,
  originImage,
  destinationImage,
}: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const [available, setAvailable] = useState<Record<string, number>>(
    fleets.reduce((acc, f) => {
      acc[f.type] = f.amount;
      return acc;
    }, {} as Record<string, number>)
  );

  const { t } = useTranslation("common");
  const { t: tShip } = useTranslation("ship");

  const onPressOrigin = (fleetId: string) => {
    if (available[fleetId] > 0) {
      setAvailable((prev) => ({ ...prev, [fleetId]: prev[fleetId] - 1 }));
      setSelected((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + 1 }));
    }
  };

  const onPressDestination = (fleetId: string) => {
    if (selected[fleetId] > 0) {
      setSelected((prev) => {
        const newSelected = { ...prev };
        newSelected[fleetId] = newSelected[fleetId] - 1;
        if (newSelected[fleetId] === 0) delete newSelected[fleetId];
        return newSelected;
      });
      setAvailable((prev) => ({ ...prev, [fleetId]: (prev[fleetId] || 0) + 1 }));
    }
  };

  const originFleets = fleets.filter((f) => (available[f.type] ?? 0) > 0);
  const destinationFleets = fleets.filter((f) => selected[f.type] > 0);

  const renderFleetItem = (item: Ship, amount: number, onPress: (id: string) => void) => (
    <TouchableOpacity style={styles.fleetItem} onPress={() => onPress(item.type)} activeOpacity={1}>
      <View style={styles.imageWrapper}>
        <Image source={shipConfig[item.type].imageBackground} style={styles.fleetImage} />
      </View>
      <Text style={styles.fleetName}>{tShip(`shipName.${item.type}`)}</Text>
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityText}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={originImage}
        style={styles.fleetBox}
        imageStyle={styles.fleetBoxImage}
      >
        <View style={styles.box}>
          <FlatList
            data={originFleets}
            keyExtractor={(item) => item.type}
            numColumns={4}
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => renderFleetItem(item, available[item.type], onPressOrigin)}
          />
        </View>
      </ImageBackground>
      <View style={{ justifyContent: "space-between", flexDirection: "row", padding: 5 }}>
        <TouchableOpacity style={commonStyles.cancelButton} onPress={() => onCancel()}>
          <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
        </TouchableOpacity>

        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-down" size={20} color="#00ffe0" />
          <Ionicons name="arrow-down" size={20} color="#00ffe0" />
          <Text style={styles.arrowText}>Enviar</Text>
          <Ionicons name="arrow-down" size={20} color="#00ffe0" />
          <Ionicons name="arrow-down" size={20} color="#00ffe0" />
        </View>

        <TouchableOpacity
          style={commonStyles.buttonPrimary}
          onPress={() => {
            const selectedFleets = fleets
              .filter((f) => selected[f.type] > 0)
              .map((f) => ({ ...f, amount: selected[f.type] }));
            onConfirm(selectedFleets);
          }}
        >
          <Text style={commonStyles.buttonTextLight}>{t("Confirm")}</Text>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={destinationImage}
        style={styles.fleetBox}
        imageStyle={styles.fleetBoxImage}
      >
        <View style={styles.box}>
          <FlatList
            data={destinationFleets}
            keyExtractor={(item) => item.type}
            numColumns={4}
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) =>
              renderFleetItem(item, selected[item.type], onPressDestination)
            }
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 5,
  },
  arrowContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  arrowText: {
    color: "#00ffe0",
    fontSize: 14,
    paddingHorizontal: 15,
  },
  fleetBox: {
    borderRadius: 12,
    flex: 0.5,
    borderWidth: 2,
    borderColor: "white",
    opacity: 0.7,
  },
  fleetBoxImage: {
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 8,
    alignContent: "center",
  },
  box: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    minHeight: 120,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  fleetItem: {
    flex: 1 / 4,
    marginHorizontal: 8,
    alignItems: "center",
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#b5fff6ff",
  },
  fleetImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fleetName: {
    color: "#ffffffff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  quantityBadge: {
    position: "absolute",
    top: 6,
    right: 14,
    backgroundColor: "#00ff90",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  quantityText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  confirmButtonContainer: {
    marginTop: "auto",
    marginBottom: 16,
  },
});
