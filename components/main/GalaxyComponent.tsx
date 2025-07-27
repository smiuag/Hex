import React from "react";
import { FlatList } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { ExploredSystemCard } from "../cards/ExploredSystemCard"; // Asegúrate de que esta importación exista
import { StarSystemCard } from "../cards/StarSystemCard";

export default function StarSystemComponent() {
  const { starSystems, discardStarSystem, exploreStarSystem } = useGameContext();

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={starSystems}
      keyExtractor={(item, index) => `star-${index}`}
      renderItem={({ item }) =>
        item.explored ? (
          <ExploredSystemCard
            system={item}
            onDiscard={discardStarSystem}
            onExplore={exploreStarSystem}
          />
        ) : (
          <StarSystemCard
            system={item}
            onDiscard={discardStarSystem}
            onExplore={exploreStarSystem}
          />
        )
      }
    />
  );
}
