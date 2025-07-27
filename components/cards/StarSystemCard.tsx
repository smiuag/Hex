import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { resourceEmojis } from "../../src/config/resourceConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceType, SpecialResourceType } from "../../src/types/resourceTypes";
import { StarSystem } from "../../src/types/starSystemTypes";
import { getExpectedResourceProbabilities } from "../../utils/starSystemUtils";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  system: StarSystem;
};

export const StarSystemCard: React.FC<Props> = ({ system }) => {
  const celestialCount = system.planets.length;
  const expected = getExpectedResourceProbabilities(system.type);

  return (
    <ImageBackground
      source={system.image}
      style={commonStyles.card}
      imageStyle={{ borderRadius: 10 }}
    >
      <View style={commonStyles.overlayDark}>
        <View style={commonStyles.rowSpaceBetween}>
          <Text style={commonStyles.titleText}>{system.name}</Text>
          <Text style={commonStyles.whiteText}>{system.distance}</Text>
        </View>
        {system.explored && (
          <Text style={commonStyles.subtitleText}>Cuerpos celestes: {celestialCount}</Text>
        )}
        <Text style={commonStyles.subtitleText}>
          Explorado: {system.explored ? "✅" : "❌"} | Conquistado: {system.conquered ? "🏁" : "❌"}
        </Text>

        {system.explored ? (
          <View style={{ marginTop: 10 }}>
            {system.planets.map((planet, index) => (
              <View key={index} style={{ marginBottom: 5 }}>
                <Text style={commonStyles.subtitleText}>
                  {planet.type}
                  {planet.planetType ? ` - ${planet.planetType}` : ""}
                </Text>
                <ResourceDisplay resources={planet.resources} fontSize={12} />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={[commonStyles.subtitleText, { marginBottom: 4 }]}>
              Recursos probables:
            </Text>
            {Object.entries(expected)
              .sort(([, a], [, b]) => b - a)
              .map(([resType, chance]) => {
                const emoji = resourceEmojis[resType as ResourceType | SpecialResourceType] ?? "❔";
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
        )}
      </View>
    </ImageBackground>
  );
};
