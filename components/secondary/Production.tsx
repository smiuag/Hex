import React from "react";
import { Text, View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { resourceBarStyles } from "../../src/styles/resourceBarStyles";
import { ResourceDisplay } from "./ResourceDisplay";

type ResourceBarProps = {
  title?: string;
  fontSize?: number;
  titleColor?: string;
  resourceColor?: string;
};

export default function ProductionBar({
  title,
  fontSize = 14,
  titleColor = "#fff",
  resourceColor = "#fff",
}: ResourceBarProps) {
  const { resources } = useGameContext();

  const productionPerHour = Object.fromEntries(
    Object.entries(resources?.production ?? {}).map(([key, value]) => [
      key,
      Math.round(value * 3600),
    ])
  );

  return (
    <View style={resourceBarStyles.containerTop}>
      {title && (
        <Text style={[resourceBarStyles.title, { color: titleColor }]}>
          {title}
        </Text>
      )}
      <View style={resourceBarStyles.resourcesContainer}>
        <ResourceDisplay
          resources={productionPerHour}
          fontSize={fontSize}
          fontColor={resourceColor}
        />
      </View>
    </View>
  );
}
