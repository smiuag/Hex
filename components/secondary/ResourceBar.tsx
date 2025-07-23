import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { Resources, ResourceType } from "../../src/types/resourceTypes";
import { ResourceDisplay } from "./ResourceDisplay";

export default function ResourceBar() {
  const { resources } = useGameContext();
  const [displayedResources, setDisplayedResources] = useState<
    Partial<Resources>
  >({});

  useEffect(() => {
    if (!resources) return;

    const updateResources = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - resources.lastUpdate) / 1000);

      const updatedResources: Partial<Resources> = { ...resources.resources };

      (Object.keys(resources.production) as ResourceType[]).forEach((key) => {
        const produced = (resources.production[key] ?? 0) * elapsedSeconds;
        updatedResources[key] = (updatedResources[key] ?? 0) + produced;
      });

      setDisplayedResources(updatedResources);
    };

    updateResources(); // initial call
    const interval = setInterval(updateResources, 1000); // update every second

    return () => clearInterval(interval);
  }, [resources]);

  if (!resources) return null;

  return (
    <View style={styles.container}>
      <View>
        <ResourceDisplay resources={displayedResources} fontSize={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
  },
});
