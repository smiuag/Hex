import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ResourceDisplay } from "../../components/secondary/ResourceDisplay";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";

export default function QuestComponent() {
  const { playerQuests, hexes, research, completeQuest, markQuestsAsViewed } =
    useGameContext();

  const hasViewedOnce = useRef(false);

  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  const availableQuests = Object.values(questConfig).filter((quest) => {
    return shouldShowQuest(quest.type, completedTypes);
  });
  useFocusEffect(
    useCallback(() => {
      if (!hasViewedOnce.current) {
        const newlyViewed = availableQuests.map((q) => q.type);
        markQuestsAsViewed(newlyViewed);
        hasViewedOnce.current = true;
      }
    }, [availableQuests])
  );

  useEffect(() => {
    if (!hasViewedOnce.current) return; // Asegura que ya se haya "enfocado" una vez

    // Buscar quests visibles no vistas aún
    const notViewedTypes = availableQuests
      .filter((q) => {
        const quest = playerQuests.find((pq) => pq.type === q.type);
        return !quest || !quest.viewed;
      })
      .map((q) => q.type);

    if (notViewedTypes.length > 0) {
      markQuestsAsViewed(notViewedTypes);
    }
  }, [availableQuests, playerQuests]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={availableQuests}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => {
        const completed = canCompleteQuest(item.type, hexes, research);
        return (
          <View style={styles.card}>
            <ImageBackground
              source={item.backgroundImage}
              style={styles.image}
              imageStyle={{ borderRadius: 10 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.rewardRow}>
                  <Text style={styles.rewardLabel}>🎁 Recompensa:</Text>
                  <ResourceDisplay resources={item.reward} fontSize={13} />
                </View>
                <TouchableOpacity
                  onPress={() => completeQuest(item.type)}
                  disabled={!completed}
                  style={[styles.button, !completed && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>Completar</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        );
      }}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 35,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    minHeight: 200,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: "#ddd",
    fontSize: 13,
    marginVertical: 4,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardBox: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  rewardText: {
    color: "#fff",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#4ade80", // verde
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#6b8dc3", // gris oscuro
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rewardLabel: {
    color: "#fff",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 2,
    fontWeight: "600",
  },
});
