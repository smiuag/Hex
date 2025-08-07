import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { shipConfig } from "../../src/config/shipConfig";
import { shipSummaryStyle } from "../../src/styles/shipSummaryStyles";
import { ShipType } from "../../src/types/shipType";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  shipCounts: Partial<Record<ShipType, number>>;
};

export function ShipSummaryBar({ shipCounts }: Props) {
  const { t: tShip } = useTranslation("ship");
  const [expanded, setExpanded] = useState(false);

  const shipItems = Object.entries(shipCounts)
    .filter(([, count]) => count && count > 0)
    .map(([type, count]) => ({
      type: type as ShipType,
      count: count ?? 0,
      icon: shipConfig[type as ShipType]?.imageBackground,
      abbreviation: type.substring(0, 2).toUpperCase(),
    }))
    .slice(0, 10);

  let firstRow: typeof shipItems = [];
  let secondRow: typeof shipItems = [];

  if (shipItems.length <= 5) {
    firstRow = shipItems;
    secondRow = [];
  } else {
    const mid = Math.ceil(shipItems.length / 2);
    firstRow = shipItems.slice(0, mid);
    secondRow = shipItems.slice(mid);
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  if (shipItems.length === 0) return null;

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleExpanded}
        style={[shipSummaryStyle.container, expanded && shipSummaryStyle.containerExpanded]}
      >
        {!expanded ? (
          <View style={shipSummaryStyle.compactRow}>
            {shipItems.map((item, idx) => (
              <Text key={item.type} style={shipSummaryStyle.compactText}>
                {item.abbreviation}:{item.count}
                {idx < shipItems.length - 1 ? "  " : ""}
              </Text>
            ))}
          </View>
        ) : (
          <>
            {[firstRow, secondRow].map((row, i) => (
              <View key={i} style={shipSummaryStyle.row}>
                {row.map((item) => (
                  <View key={item.type} style={shipSummaryStyle.item}>
                    <View style={shipSummaryStyle.iconWrapper}>
                      <Image source={item.icon} style={shipSummaryStyle.icon} />
                    </View>
                    {item.count > 0 && (
                      <View style={shipSummaryStyle.countBadge}>
                        <Text style={shipSummaryStyle.countText}>{item.count}</Text>
                      </View>
                    )}
                    <Text style={shipSummaryStyle.label}>{tShip(`shipName.${item.type}`)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
