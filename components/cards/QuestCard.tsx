import { questConfig } from "@/src/config/questConfig";
import { useGameContextSelector } from "@/src/context/GameContext";
import { PlayerQuest } from "@/src/types/questType";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../src/styles/commonStyles";
import { ResourceDisplay } from "../auxiliar/ResourceDisplay";

type Props = {
  item: PlayerQuest;
  completed: boolean;
  isAlreadyClaimed: boolean;
  onClaimReward: () => void;
};

export const QuestCard: React.FC<Props> = ({
  item,
  completed,
  isAlreadyClaimed,
  onClaimReward,
}) => {
  const { t } = useTranslation("common");
  const { t: tQuests } = useTranslation("quests");
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const playerQuests = useGameContextSelector((ctx) => ctx.playerQuests);
  const config = questConfig[item.type];
  const isViewed = playerQuests.some((pq) => pq.type == item.type && pq.viewed);

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

  const handlePress = async () => {
    triggerAnimation();
    onClaimReward();
  };

  if (!config.persist && isAlreadyClaimed) return null;

  return (
    <Animated.View style={[commonStyles.containerCenter, { transform: [{ scale }] }]}>
      <ImageBackground
        source={config.backgroundImage}
        style={isAlreadyClaimed ? commonStyles.cardMini : commonStyles.card}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <View>
            <View
              style={[
                commonStyles.rowSpaceBetween,
                isAlreadyClaimed && commonStyles.cardMiniMiddleCenter,
              ]}
            >
              <Text style={commonStyles.titleText}>{tQuests(`${item.type}.name`)}</Text>
              <TouchableOpacity
                onPress={() => {
                  router.replace(`/(tabs)/quests/computer?type=${item.type}`);
                }}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 6,
                }}
              >
                <Ionicons name="play" size={20} color={isViewed ? "white" : "limegreen"} />
              </TouchableOpacity>
            </View>

            {!isAlreadyClaimed && (
              <Text style={[commonStyles.subtitleText, { paddingTop: 10 }]}>
                {tQuests(`${item.type}.shortDescription`)}
              </Text>
            )}
          </View>
          <View>
            {!isAlreadyClaimed && (
              <>
                <View style={commonStyles.rowSpaceBetween}>
                  <Text style={commonStyles.whiteText}>{t("reward")}</Text>
                  <View style={commonStyles.rowResources}>
                    <ResourceDisplay resources={config.reward} fontSize={13} />
                  </View>
                </View>
                <View style={commonStyles.actionBar}>
                  <View></View>
                  <TouchableOpacity
                    onPress={handlePress}
                    disabled={!completed}
                    style={[commonStyles.buttonPrimary, !completed && commonStyles.buttonDisabled]}
                  >
                    <Text style={commonStyles.buttonTextLight}>{t("complete")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};
