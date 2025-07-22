import React, { useEffect } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { useGameContext } from "../../src/context/GameContext";
import { canCompleteQuest, shouldShowQuest } from "../../utils/questUtils";

export default function QuestComponent() {
  console.log("22222");
  const { playerQuests, completeQuest, markQuestsAsViewed } = useGameContext();

  // Extrae tipos de misiones completadas
  const completedTypes = playerQuests
    .filter((q) => q.completed)
    .map((q) => q.type)
    .flat();

  // Solo muestra misiones disponibles
  const availableQuests = Object.values(questConfig).filter((quest) => {
    return shouldShowQuest(quest.type, completedTypes);
  });

  // Marcar como vistas cuando se entra
  useEffect(() => {
    const newlyViewed = availableQuests.map((q) => q.type);
    markQuestsAsViewed(newlyViewed);
  }, []);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={availableQuests}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => {
        const completed = canCompleteQuest(item.type);
        return (
          <View style={styles.card}>
            <ImageBackground
              source={item.backgroundImage}
              style={styles.image}
              imageStyle={{ borderRadius: 10 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.title}>{item.namme}</Text>
                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.rewardBox}>
                  {Object.entries(item.reward).map(([key, value]) => (
                    <Text key={key} style={styles.rewardText}>
                      {key}: {value}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => completeQuest(item.type)}
                  disabled={!completed}
                  style={[styles.button, !completed && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>
                    {completed ? "Completar" : "No disponible"}
                  </Text>
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: 160,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
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
    backgroundColor: "#6b7280", // gris oscuro
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
