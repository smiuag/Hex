import { IMAGES } from "@/src/constants/images";
import { useIsFocused } from "@react-navigation/native";
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
  const startPlanetExploration = useGameContextSelector((ctx) => ctx.startPlanetExploration);
  const cancelExplorePlanet = useGameContextSelector((ctx) => ctx.cancelExplorePlanet);
  const stelarPortStartBuild = useGameContextSelector((ctx) => ctx.stelarPortStartBuild);
  const defenseStartBuild = useGameContextSelector((ctx) => ctx.defenseStartBuild);
  const extractionStartBuild = useGameContextSelector((ctx) => ctx.extractionStartBuild);
  const cancelAttack = useGameContextSelector((ctx) => ctx.cancelAttack);
  const startStarSystemExploration = useGameContextSelector(
    (ctx) => ctx.startStarSystemExploration
  );
  const cancelExploreSystem = useGameContextSelector((ctx) => ctx.cancelExploreSystem);

  const isFocused = useIsFocused();
  if (!isFocused) return null;

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
            system={item}
            onDiscard={onDiscard}
            onExplorePlanet={startPlanetExploration}
            onCancelExplorePlanet={cancelExplorePlanet}
            onStelarPortBuild={stelarPortStartBuild}
            onDefenseStartBuild={defenseStartBuild}
            onExtractionStartBuild={extractionStartBuild}
          />
        ) : item.explored ? (
          <SystemDefendedCard system={item} onDiscard={onDiscard} onCancelAttack={cancelAttack} />
        ) : (
          <SystemUnknownCard
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
