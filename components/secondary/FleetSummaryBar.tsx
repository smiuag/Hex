import React, { useState } from "react";
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { fleetConfig } from "../../src/config/fleetConfig";
import { FleetType } from "../../src/types/fleetType";

const { width } = Dimensions.get("window");

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  fleetCounts: Partial<Record<FleetType, number>>;
};

export function FleetSummaryBar({ fleetCounts }: Props) {
  const [expanded, setExpanded] = useState(false);

  const fleetItems = Object.entries(fleetCounts)
    .filter(([, count]) => count && count > 0)
    .map(([type, count]) => ({
      type: type as FleetType,
      count: count ?? 0,
      icon: fleetConfig[type as FleetType]?.imageBackground,
      abbreviation: type.substring(0, 2).toUpperCase(),
    }))
    .slice(0, 10);

  const firstRow = fleetItems.slice(0, 5);
  const secondRow = fleetItems.slice(5, 10);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleExpanded}
      style={[styles.container, expanded && styles.containerExpanded]}
    >
      {!expanded ? (
        <View style={styles.compactRow}>
          {fleetItems.map((item, idx) => (
            <Text key={item.type} style={styles.compactText}>
              {item.abbreviation}:{item.count}
              {idx < fleetItems.length - 1 ? "  " : ""}
            </Text>
          ))}
        </View>
      ) : (
        <>
          {[firstRow, secondRow].map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((item) => (
                <View style={styles.item}>
                  <View style={styles.iconWrapper}>
                    <Image source={item.icon} style={styles.icon} />
                  </View>
                  {item.count > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{item.count}</Text>
                    </View>
                  )}
                  <Text style={styles.label}>
                    {fleetConfig[item.type as FleetType]?.name}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(30,30,30,0.9)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
  },
  containerExpanded: {
    paddingBottom: 16,
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  compactText: {
    color: "#ccc",
    fontWeight: "600",
    fontSize: 12,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  item: {
    alignItems: "center",
    width: (width - 60) / 5,
  },
  iconWrapper: {
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  icon: {
    width: "200%",
    height: "200%",
    resizeMode: "contain",
  },
  countBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#e63946",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 14,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    color: "#ccc",
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: "center",
  },
});
