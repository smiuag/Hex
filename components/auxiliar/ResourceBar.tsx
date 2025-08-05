import { isSpecialResourceType } from "@/utils/resourceUtils";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { resourceBarStyles } from "../../src/styles/resourceBarStyles";
import {
  CombinedResources,
  CombinedResourcesType,
  StoredResources,
} from "../../src/types/resourceTypes";
import { ResourceDisplay } from "./ResourceDisplay";

interface Props {
  storedResources: StoredResources;
  showSpecial?: boolean;
}

export default function ResourceBar({ storedResources, showSpecial = true }: Props) {
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const [displayedResources, setDisplayedResources] = useState<Partial<CombinedResources>>({});

  useEffect(() => {
    if (!storedResources || !hexes || hexes.length === 0) {
      setDisplayedResources({});
    } else {
      const updateResources = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - storedResources.lastUpdate) / 1000);

        const updatedResources: Partial<CombinedResources> = { ...storedResources.resources };

        (Object.keys(storedResources.production) as CombinedResourcesType[]).forEach((key) => {
          const isSpecial = isSpecialResourceType(key);
          if (!showSpecial && isSpecial) return;

          const produced = (storedResources.production[key] ?? 0) * elapsedSeconds;
          updatedResources[key] = (updatedResources[key] ?? 0) + produced;
        });

        setDisplayedResources(updatedResources);
      };

      updateResources();
      const interval = setInterval(updateResources, 1000);

      return () => clearInterval(interval);
    }
  }, [storedResources, showSpecial, hexes]);

  if (!storedResources) return null;

  return (
    <View style={resourceBarStyles.container}>
      <View>
        <ResourceDisplay resources={displayedResources} fontSize={16} />
      </View>
    </View>
  );
}
