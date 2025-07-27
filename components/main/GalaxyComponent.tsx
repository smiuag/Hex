import React from "react";
import { FlatList } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { SystemExploredCard } from "../cards/SystemExploredCard";
import { SystemUnknownCard } from "../cards/SystemUnkownCard";

export default function StarSystemComponent() {
  const { starSystems, discardStarSystem, exploreStarSystem } = useGameContext();

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={starSystems}
      keyExtractor={(item, index) => `star-${index}`}
      renderItem={({ item }) =>
        item.explored ? (
          <SystemExploredCard system={item} onDiscard={discardStarSystem} />
        ) : (
          <SystemUnknownCard
            system={item}
            onDiscard={discardStarSystem}
            onExplore={exploreStarSystem}
          />
        )
      }
    />
  );
}
