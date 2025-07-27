import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { StarSystem } from "../../src/types/starSystemTypes";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  system: StarSystem;
  onDiscard: (id: string) => void;
  onExplore: (id: string) => void;
};

export const ExploredSystemCard: React.FC<Props> = ({ system }) => {
  const totalBodies = system.planets.length;
  const exploredBodies = system.planets.filter((b) => b.explored).length;
  const unexploredBodies = totalBodies - exploredBodies;

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

          <Text style={commonStyles.subtitleText}>
            Cuerpos celestes: {totalBodies} | Explorados: {exploredBodies} | Sin explorar:{" "}
            {unexploredBodies}
          </Text>

          <View style={{ marginTop: 10 }}>
            {system.planets.map((planet, index) => (
              <View key={index} style={{ marginBottom: 5 }}>
                <Text style={commonStyles.subtitleText}>
                  {planet.type}
                  {planet.planetType ? ` - ${planet.planetType}` : ""}{" "}
                  {planet.explored ? "✅" : "❌"}
                </Text>
                {planet.explored && <ResourceDisplay resources={planet.resources} fontSize={12} />}
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
