import React, { useRef } from "react";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { questConfig } from "../../src/config/questConfig";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  item: (typeof questConfig)[keyof typeof questConfig];
  completed: boolean;
  isAlreadyClaimed: boolean;
  onComplete: () => void;
};

export const QuestCard: React.FC<Props> = ({ item, completed, isAlreadyClaimed, onComplete }) => {
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
    <Animated.View style={[commonStyles.containerCenter, { transform: [{ scale }] }]}>
      <ImageBackground
        source={item.backgroundImage}
        style={commonStyles.card}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <Text style={commonStyles.titleText}>{item.name}</Text>
            <Text style={commonStyles.subtitleText}>{item.description}</Text>
          </View>
          {!isAlreadyClaimed && (
            <View style={commonStyles.actionBar}>
              <ResourceDisplay resources={item.reward} fontSize={13} />

              <TouchableOpacity
                onPress={handlePress}
                disabled={!completed}
                style={[commonStyles.buttonPrimary, !completed && commonStyles.buttonDisabled]}
              >
                <Text style={commonStyles.buttonTextLight}>Completar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
