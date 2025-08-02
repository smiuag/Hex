import { IMAGES } from "@/src/constants/images";
import { commonStyles } from "@/src/styles/commonStyles";
import { getBuildTime } from "@/utils/buildingUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useGameContext } from "../../src/context/GameContext";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

export default function AntennaComponent() {
  const { universe, hexes, research, handleCancelBuild, handleBuild } = useGameContext();
  const { t } = useTranslation("common");
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { q, r } = params;
  const qNum = parseInt(q as string, 10);
  const rNum = parseInt(r as string, 10);
  const data = hexes.find((h) => h.q === qNum && h.r === rNum);

  if (!universe || !data) return <Text>Cargando universo...</Text>;

  const onCancel = () => {
    handleCancelBuild(qNum, rNum);
  };

  const onBuild = () => {
    if (data.building) handleBuild(qNum, rNum, data.building.type);
  };

  const getMainArea = () => {
    if (data.construction) {
      const totalBuildTime = getBuildTime(
        data.construction.building,
        data.construction.targetLevel
      );

      return (
        <View style={commonStyles.mainBuilding}>
          <UnderConstructionCard
            data={data}
            onCancelBuild={onCancel}
            duration={totalBuildTime}
            startedAt={data.construction.startedAt}
          />
        </View>
      );
    } else {
      return (
        <View style={commonStyles.mainBuilding}>
          <UpgradeCard data={data} onBuild={onBuild} research={research} />
        </View>
      );
    }
  };

  const onClose = () => {
    router.replace("/planet");
  };

  const ClusterItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={IMAGES.BACKGROUND_CLUSTER}
        style={commonStyles.cardMini}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <Text style={commonStyles.titleText}>
            {t("Cluster")}: {name}
          </Text>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>{t("ExploredSystems")} :</Text>
            <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
              <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const GalaxyItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={IMAGES.BACKGROUND_GALAXY}
        style={commonStyles.cardMini}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleText}>
              {t("Galaxy")}: {name}
            </Text>
          </View>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.whiteText}>{t("exploredSystems")}: </Text>
            <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
              <Text style={commonStyles.buttonTextLight}>{t("explore")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const RegionItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={IMAGES.BACKGROUND_REGION}
        style={commonStyles.cardMini}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleText}>
              {t("Region")}: {name}
            </Text>
          </View>
          <View style={commonStyles.actionBar}>
            <Text style={commonStyles.whiteText}>{t("exploredSystems")}: </Text>
            <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
              <Text style={commonStyles.buttonTextLight}>{t("explore")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const SystemItem = ({
    system,
    onPress,
    t,
  }: {
    system: { id: string; name: string };
    onPress: () => void;
    t: any;
  }) => (
    <View style={commonStyles.containerCenter}>
      <ImageBackground
        source={IMAGES.BACKGROUND_REGION}
        style={commonStyles.cardMini}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={commonStyles.overlayDark}>
          <View style={commonStyles.rowSpaceBetween}>
            <Text style={commonStyles.titleText}>{system.name}</Text>
            <Text style={commonStyles.whiteText}>{t("exploredSystems")}:</Text>
          </View>
          <View style={commonStyles.actionBar}>
            <View />
            <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
              <Text style={commonStyles.buttonTextLight}>{t("explore")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const BackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
      <Text style={commonStyles.closeText}>{t("back")}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onClose} style={commonStyles.closeXButton}>
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>

      <View>{getMainArea()}</View>

      {/* Navigation layers below */}
      {!selectedCluster && (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={Object.keys(universe)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ClusterItem name={item} onPress={() => setSelectedCluster(item)} t={t} />
          )}
        />
      )}

      {selectedCluster && !selectedGalaxy && (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={Object.keys(universe[selectedCluster])}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <GalaxyItem name={item} onPress={() => setSelectedGalaxy(item)} t={t} />
          )}
          ListFooterComponent={<BackButton onPress={() => setSelectedCluster(null)} />}
        />
      )}

      {selectedCluster && selectedGalaxy && !selectedRegion && (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={Object.keys(universe[selectedCluster][selectedGalaxy])}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <RegionItem name={item} onPress={() => setSelectedRegion(item)} t={t} />
          )}
          ListFooterComponent={<BackButton onPress={() => setSelectedGalaxy(null)} />}
        />
      )}

      {selectedCluster && selectedGalaxy && selectedRegion && (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={universe[selectedCluster][selectedGalaxy][selectedRegion]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SystemItem system={item} onPress={() => setSelectedRegion(item.name)} t={t} />
          )}
          ListFooterComponent={<BackButton onPress={() => setSelectedRegion(null)} />}
        />
      )}
    </View>
  );
}
