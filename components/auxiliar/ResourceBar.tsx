import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { resourceBarStyles } from "../../src/styles/resourceBarStyles";
import { Resources, ResourceType } from "../../src/types/resourceTypes";
import { ResourceDisplay } from "./ResourceDisplay";

export default function ResourceBar() {
  const { resources, hexes } = useGameContext();
  const [displayedResources, setDisplayedResources] = useState<
    Partial<Resources>
  >({});

  useEffect(() => {
    if (!resources || !hexes || hexes.length === 0) {
      setDisplayedResources({});
    } else {
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
    }
  }, [resources]);

  if (!resources) return null;

  return (
    <View style={resourceBarStyles.container}>
      <View>
        <ResourceDisplay resources={displayedResources} fontSize={16} />
      </View>
    </View>
  );
}
