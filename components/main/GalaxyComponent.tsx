import React from "react";
import { FlatList } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { SystemDefendedCard } from "../cards/SystemDefendedCard";
import { SystemExploredCard } from "../cards/SystemExploredCard";
import { SystemUnknownCard } from "../cards/SystemUnkownCard";

export default function StarSystemComponent() {
  const {
    starSystems,
    discardStarSystem,
    startPlanetExploration,
    cancelExploreSystem,
    cancelExplorePlanet,
    startStarSystemExploration,
  } = useGameContext();

  const startStarSystemAttack = () => {};

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={starSystems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) =>
        item.conquered && item.explored ? (
          <SystemExploredCard
            system={item}
            onDiscard={discardStarSystem}
            onExplorePlanet={startPlanetExploration}
            onCancelExplorePlanet={cancelExplorePlanet}
          />
        ) : item.explored ? (
          <SystemDefendedCard
            system={item}
            onDiscard={discardStarSystem}
            onAttack={startStarSystemAttack}
          />
        ) : (
          <SystemUnknownCard
            system={item}
            onDiscard={discardStarSystem}
            onExplore={startStarSystemExploration}
            onCancelExploreSystem={cancelExploreSystem}
          />
        )
      }
    />
  );
}
