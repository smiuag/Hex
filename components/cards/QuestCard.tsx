import { useGameContext } from "@/src/context/GameContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next"; // ✅ Importamos i18n hook
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
  const { t } = useTranslation("common");
  const { t: tQuests } = useTranslation("quests");
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const questType = item.type.toString();
  const { playerQuests } = useGameContext();

  const isViewed = playerQuests.some((pq) => pq.type == questType && pq.viewed);

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
    onComplete();
  };

  console.log(item.persist);
  console.log(completed);
  if (!item.persist && isAlreadyClaimed) return null;

  return (
    <Animated.View style={[commonStyles.containerCenter, { transform: [{ scale }] }]}>
      <ImageBackground
        source={item.backgroundImage}
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
                  router.replace(`/quests/computer?id=${questType}`);
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
                    <ResourceDisplay resources={item.reward} fontSize={13} />
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
