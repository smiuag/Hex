import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { resourceEmojis } from "../../src/config/resourceConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceType, SpecialResourceType } from "../../src/types/resourceTypes";
import { StarSystem } from "../../src/types/starSystemTypes";
import { getExpectedResourceProbabilities } from "../../utils/starSystemUtils";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplore: (id: string) => void;
};

export const StarSystemCard: React.FC<Props> = ({ system, onDiscard, onExplore }) => {
  const expected = getExpectedResourceProbabilities(system.type);
  const enoughProbe = true;

  return (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={system.image}
        style={commonStyles.card}
        imageStyle={commonStyles.imageCover}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleText}>{system.name}</Text>
            <Text style={commonStyles.whiteText}>{system.distance} Parsecs</Text>
          </View>

          <>
            <View style={{ marginTop: 10 }}>
              {Object.entries(expected)
                .sort(([, a], [, b]) => b - a)
                .map(([resType, chance]) => {
                  const emoji =
                    resourceEmojis[resType as ResourceType | SpecialResourceType] ?? "❔";
                  const percent = Math.round(chance * 100);
                  return (
                    <Text
                      key={resType}
                      style={[commonStyles.subtitleText, { fontSize: 12, marginVertical: 1 }]}
                    >
                      {emoji} {percent}% de obtener {resType}
                    </Text>
                  );
                })}
            </View>
            <View style={commonStyles.actionBar}>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => onDiscard(system.id)}
              >
                <Text style={commonStyles.cancelButtonText}>Descartar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={commonStyles.buttonPrimary}
                disabled={!enoughProbe}
                onPress={() => onExplore(system.id)}
              >
                <Text style={commonStyles.buttonTextLight}>Explorar</Text>
              </TouchableOpacity>
            </View>
          </>
        </View>
      </ImageBackground>
    </View>
  );
};
