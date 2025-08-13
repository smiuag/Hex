import { IMAGES } from "@/src/constants/images";
import { commonStyles } from "@/src/styles/commonStyles";
import { DiplomaticEvent, EventOption } from "@/src/types/eventTypes";
import { raceConfig } from "@/src/types/raceType";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import OptionCard from "./OptionCard";

type Props = {
  diplomaticEvent: DiplomaticEvent;
  onChoose?: (option: EventOption) => void;
};

export default function EventCard({ diplomaticEvent, onChoose }: Props) {
  const config = raceConfig[diplomaticEvent.races];

  return (
    <View style={[commonStyles.cardContainer, { marginTop: 10 }]}>
      <ImageBackground source={IMAGES.EVENT_TRADE} style={commonStyles.card}>
        <View style={{ padding: 10, minHeight: 350 }}>
          <View style={[styles.header, { padding: 5 }]}>
            <Image source={config.emblem} style={styles.emblem} resizeMode="contain" />

            <View style={styles.titleWrap}>
              <Text
                style={[commonStyles.titleText, { flexShrink: 1 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {diplomaticEvent.title}
              </Text>
            </View>
          </View>
          {diplomaticEvent.completed ? (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Feather name="check-circle" size={64} style={{ opacity: 0.25, color: "#fff" }} />
              </View>
            </View>
          ) : diplomaticEvent.options?.length ? (
            <>
              <View style={{ padding: 5 }}>
                <Text style={commonStyles.subtitleText}>{diplomaticEvent.description}</Text>
              </View>
              <ScrollView style={styles.optionsScroll} contentContainerStyle={{ paddingBottom: 6 }}>
                {diplomaticEvent.options.map((opt, i) => (
                  <OptionCard
                    key={`${opt.type}-${i}`}
                    diplomaticEvent={diplomaticEvent}
                    option={opt}
                    onChoose={onChoose}
                  />
                ))}
              </ScrollView>
            </>
          ) : (
            <Text style={styles.dim}>No hay opciones disponibles.</Text>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  emblem: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 3,
  },
  optionsScroll: {
    marginTop: 2,
    flexGrow: 1,
  },
  pos: { color: "#22c55e", fontWeight: "700" },
  neg: { color: "#ef4444", fontWeight: "700" },
  dim: { color: "#94a3b8" },
});
