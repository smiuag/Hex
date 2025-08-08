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
  showOnlySpecial?: boolean;
  showOnlyNormal?: boolean;
  miniSyle?: boolean;
}

export default function ResourceBar({
  storedResources,
  showSpecial = true,
  showOnlySpecial = false,
  showOnlyNormal = false,
  miniSyle = false,
}: Props) {
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const [displayedResources, setDisplayedResources] = useState<Partial<CombinedResources>>({});

  useEffect(() => {
    if (!storedResources || !Array.isArray(hexes) || hexes.length === 0) {
      setDisplayedResources({});
      return;
    }

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
  }, [storedResources, showSpecial, hexes]);

  if (!storedResources) return null;

  return (
    <View style={!miniSyle && resourceBarStyles.container}>
      <View>
        <ResourceDisplay
          resources={displayedResources}
          showOnlyNormal={showOnlyNormal}
          showOnlySpecial={showOnlySpecial}
          fontSize={miniSyle ? 14 : 16}
          miniSyle={miniSyle}
        />
      </View>
    </View>
  );
}
