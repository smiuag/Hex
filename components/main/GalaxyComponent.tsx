import { IMAGES } from "@/src/constants/images";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, ImageBackground, Text } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import { SystemDefendedCard } from "../cards/SystemDefendedCard";
import { SystemExploredCard } from "../cards/SystemExploredCard";
import { SystemUnknownCard } from "../cards/SystemUnkownCard";

export default function StarSystemComponent() {
  const { t } = useTranslation("common");
  const starSystems = useGameContextSelector((ctx) => ctx.starSystems);
  const discardStarSystem = useGameContextSelector((ctx) => ctx.discardStarSystem);
  const startCelestialBodyExploration = useGameContextSelector(
    (ctx) => ctx.startCelestialBodyExploration
  );
  const cancelExplorePlanet = useGameContextSelector((ctx) => ctx.cancelExplorePlanet);
  const starPortStartBuild = useGameContextSelector((ctx) => ctx.starPortStartBuild);
  const defenseStartBuild = useGameContextSelector((ctx) => ctx.defenseStartBuild);
  const extractionStartBuild = useGameContextSelector((ctx) => ctx.extractionStartBuild);
  const cancelAttack = useGameContextSelector((ctx) => ctx.cancelAttack);
  const startCollectSystem = useGameContextSelector((ctx) => ctx.startCollectSystem);
  const startStarSystemExploration = useGameContextSelector(
    (ctx) => ctx.startStarSystemExploration
  );
  const cancelExploreSystem = useGameContextSelector((ctx) => ctx.cancelExploreSystem);
  const cancelCollect = useGameContextSelector((ctx) => ctx.cancelCollect);

  const exploredSystems = starSystems.filter((s) => !s.scanStartedAt && !s.discarded);

  const onDiscard = (id: string) => {
    Alert.alert("💀 ¡Alerta!", "¿Estás seguro de que quieres descartar este sistema?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          discardStarSystem(id);
        },
      },
    ]);
  };

  if (exploredSystems.length === 0) {
    return (
      <ImageBackground
        source={IMAGES.BACKGROUND_QUEST_IMAGE}
        style={[commonStyles.flexCenter, { padding: 24, flex: 1 }]}
        imageStyle={{ resizeMode: "cover", opacity: 0.4 }}
      >
        <Text style={commonStyles.titleText}>{t("VoidExplorationScreenTitle")}</Text>
        <Text style={commonStyles.subtitleText}>{t("VoidExplorationScreenSubTitle")}</Text>
      </ImageBackground>
    );
  }

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={exploredSystems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) =>
        item.conquered ? (
          <SystemExploredCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onExplorePlanet={startCelestialBodyExploration}
            onCancelExplorePlanet={cancelExplorePlanet}
            onStarPortBuild={starPortStartBuild}
            onDefenseStartBuild={defenseStartBuild}
            onExtractionStartBuild={extractionStartBuild}
            onStartCollectSystem={startCollectSystem}
            onCancelCollectSystem={cancelCollect}
          />
        ) : item.explored ? (
          <SystemDefendedCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onCancelAttack={cancelAttack}
          />
        ) : (
          <SystemUnknownCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onExplore={startStarSystemExploration}
            onCancelExploreSystem={cancelExploreSystem}
          />
        )
      }
    />
  );
}
