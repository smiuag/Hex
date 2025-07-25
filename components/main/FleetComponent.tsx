import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fleetConfig } from "../../src/config/fleetConfig";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { FleetType } from "../../src/types/fleetType";
import { formatDuration } from "../../utils/generalUtils";
import { hasEnoughResources } from "../../utils/resourceUtils";
import { ResourceDisplay } from "../secondary/ResourceDisplay";

const { width } = Dimensions.get("window");

export default function FleetComponent() {
  const [queuedAmounts, setQueuedAmounts] = useState<
    Partial<Record<FleetType, number>>
  >({});

  const delayRef = useRef(300);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    fleetBuildQueue,
    handleBuildFleet,
    handleCancelFleet,
    resources,
    hexes,
  } = useGameContext();

  const adjustQueue = (type: FleetType, direction: "add" | "remove") => {
    setQueuedAmounts((prev) => {
      const current = prev[type] ?? 0;
      if (direction === "add") {
        handleBuildFleet(type, 1);
        return { ...prev, [type]: current + 1 };
      } else if (direction === "remove" && current > 0) {
        handleCancelFleet(type);
        return { ...prev, [type]: current - 1 };
      }
      return prev;
    });
  };

  const startLoop = (type: FleetType, direction: "add" | "remove") => {
    delayRef.current = 300;

    const loop = () => {
      adjustQueue(type, direction);
      delayRef.current = Math.max(30, delayRef.current * 0.4);
      loopRef.current = setTimeout(loop, delayRef.current);
    };

    loop();
  };

  const stopLoop = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
    loopRef.current = null;
  };

  const handleLongPress =
    (type: FleetType, direction: "add" | "remove") => () => {
      startLoop(type, direction);
    };

  const handlePressOut = () => {
    stopLoop();
  };

  const hasSpaceStation = hexes.some((h) => h.building?.type == "SPACESTATION");

  const fleetItems = Object.entries(fleetConfig)
    .map(([key, config]) => {
      const type = key as FleetType;
      const owned =
        fleetBuildQueue.find((f) => f.data.type === type)?.data.amount ?? 0;

      const inQueue = queuedAmounts[type] ?? 0;
      const totalCost = config.baseCost;
      const totalTime = config.baseBuildTime * inQueue;

      return {
        key: type,
        ...config,
        type,
        inQueue,
        owned,
        totalCost,
        totalTime,
        canBuild: hasEnoughResources(resources, config.baseCost),
      };
    })
    .filter((item) => item.productionFacility == "HANGAR" || hasSpaceStation)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <FlatList
      data={fleetItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={commonStyles.flatList}
      renderItem={({ item }) => (
        <View style={commonStyles.cardContainer}>
          <ImageBackground
            source={item.imageBackground}
            style={commonStyles.card}
            imageStyle={[
              commonStyles.imageCover,
              !item.canBuild && commonStyles.imageUnavailable,
            ]}
          >
            <View style={commonStyles.overlayDark}>
              <View>
                <View style={commonStyles.headerRow}>
                  <Text style={commonStyles.titleText}>
                    {item.name}{" "}
                    <Text style={commonStyles.whiteText}>
                      ({formatDuration(item.baseBuildTime)})
                    </Text>
                  </Text>
                  {item.owned > 0 && (
                    <Text style={commonStyles.whiteText}>{item.owned}</Text>
                  )}
                </View>
                <Text style={commonStyles.subtitleText}>
                  {item.description}
                </Text>
              </View>

              <View>
                <View style={commonStyles.rowResources}>
                  <ResourceDisplay resources={item.totalCost} fontSize={13} />
                </View>

                <Text style={commonStyles.whiteText}>
                  ⏱️ Tiempo estimado: {formatDuration(item.totalTime)}
                </Text>

                <View style={commonStyles.actionBar}>
                  <TouchableOpacity
                    style={commonStyles.cancelButton}
                    onPress={() => adjustQueue(item.type, "remove")}
                    onLongPress={handleLongPress(item.type, "remove")}
                    onPressOut={handlePressOut}
                    disabled={item.inQueue === 0}
                  >
                    <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <View style={commonStyles.queueCountContainer}>
                    {item.inQueue > 0 && (
                      <Text style={commonStyles.queueCount}>
                        {item.inQueue}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      commonStyles.buttonPrimary,
                      !item.canBuild && commonStyles.buttonDisabled,
                    ]}
                    onPress={() => adjustQueue(item.type, "add")}
                    onLongPress={handleLongPress(item.type, "add")}
                    onPressOut={handlePressOut}
                    disabled={!item.canBuild}
                  >
                    <Text style={commonStyles.buttonTextLight}>Construir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
    />
  );
}
