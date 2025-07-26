import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { fleetConfig } from "../../src/config/fleetConfig";
import { fleetSummaryStyle } from "../../src/styles/fleetSummaryStyles";
import { FleetType } from "../../src/types/fleetType";

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

  let firstRow: typeof fleetItems = [];
  let secondRow: typeof fleetItems = [];

  if (fleetItems.length <= 5) {
    firstRow = fleetItems;
    secondRow = [];
  } else {
    const mid = Math.ceil(fleetItems.length / 2);
    firstRow = fleetItems.slice(0, mid);
    secondRow = fleetItems.slice(mid);
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={fleetItems.length == 0 && fleetSummaryStyle.hidden}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleExpanded}
        style={[
          fleetSummaryStyle.container,
          expanded && fleetSummaryStyle.containerExpanded,
        ]}
      >
        {!expanded ? (
          <View style={fleetSummaryStyle.compactRow}>
            {fleetItems.map((item, idx) => (
              <Text key={item.type} style={fleetSummaryStyle.compactText}>
                {item.abbreviation}:{item.count}
                {idx < fleetItems.length - 1 ? "  " : ""}
              </Text>
            ))}
          </View>
        ) : (
          <>
            {[firstRow, secondRow].map((row, i) => (
              <View key={i} style={fleetSummaryStyle.row}>
                {row.map((item) => (
                  <View key={item.type} style={fleetSummaryStyle.item}>
                    <View style={fleetSummaryStyle.iconWrapper}>
                      <Image
                        source={item.icon}
                        style={fleetSummaryStyle.icon}
                      />
                    </View>
                    {item.count > 0 && (
                      <View style={fleetSummaryStyle.countBadge}>
                        <Text style={fleetSummaryStyle.countText}>
                          {item.count}
                        </Text>
                      </View>
                    )}
                    <Text style={fleetSummaryStyle.label}>
                      {fleetConfig[item.type as FleetType]?.name}
                    </Text>
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
