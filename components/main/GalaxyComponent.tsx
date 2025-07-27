import React from "react";
import { FlatList } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystemCard } from "../cards/StarSystemCard";

export default function StarSystemComponent() {
  const { starSystems } = useGameContext();

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={starSystems}
      keyExtractor={(item, index) => `star-${index}`}
      renderItem={({ item }) => <StarSystemCard system={item} />}
    />
  );
}
