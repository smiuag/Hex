import React, { useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ResourceDisplay } from "../../components/secondary/ResourceDisplay";
import { questConfig } from "../../src/config/questConfig";

type Props = {
  item: (typeof questConfig)[keyof typeof questConfig];
  completed: boolean;
  onComplete: () => void;
};

export const QuestCard: React.FC<Props> = ({ item, completed, onComplete }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    triggerAnimation();
    onComplete();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scale }] }]}>
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
            onPress={handlePress}
            disabled={!completed}
            style={[styles.button, !completed && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Completar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  rewardLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4ade80",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#6b8dc3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
