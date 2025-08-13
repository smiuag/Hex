import { SCAN_DURATION } from "@/src/constants/general";
import { IMAGES } from "@/src/constants/images";
import rawData from "@/src/data/names.json";
import { commonStyles } from "@/src/styles/commonStyles";
import { raceConfig } from "@/src/types/raceType";
import { StarSystemDetected } from "@/src/types/starSystemTypes";
import { UniverseNameMap } from "@/src/types/universeFantasyNames";
import { getBuildTime } from "@/utils/buildingUtils";
import { gameStartingSystem } from "@/utils/configUtils";
import {
  getGalaxiesFromCluster,
  getRegionsFromGalaxy,
  getSystemImage,
  getSystemsFromRegion,
} from "@/utils/starSystemUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { CountdownTimer } from "../auxiliar/CountdownTimer";
import { UnderConstructionCard } from "../cards/UnderConstructionCard";
import { UpgradeCard } from "../cards/UpgradeCard";

export default function AntennaComponent() {
  const universe = useGameContextSelector((ctx) => ctx.universe);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const research = useGameContextSelector((ctx) => ctx.research);
  const playerConfig = useGameContextSelector((ctx) => ctx.playerConfig);
  const starSystems = useGameContextSelector((ctx) => ctx.starSystems);
  const handleCancelBuild = useGameContextSelector((ctx) => ctx.handleCancelBuild);
  const handleBuild = useGameContextSelector((ctx) => ctx.handleBuild);
  const scanStarSystem = useGameContextSelector((ctx) => ctx.scanStarSystem);
  const recoverStarSystem = useGameContextSelector((ctx) => ctx.recoverStarSystem);
  const cancelScanStarSystem = useGameContextSelector((ctx) => ctx.cancelScanStarSystem);

  const { t } = useTranslation("common");

  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Ref del FlatList de sistemas + control para autoscroll por región
  const systemsListRef = useRef<FlatList<StarSystemDetected>>(null);
  const autoScrolledKeysRef = useRef<Set<string>>(new Set());

  const router = useRouter();
  const startingSystemId = gameStartingSystem(playerConfig);
  const startingSystem = universe[startingSystemId];
  const universeNames = rawData as UniverseNameMap;

  const data = hexes.find(
    (h) => h.building?.type == "ANTENNA" || h.construction?.building == "ANTENNA"
  );

  let visibleClusters: string[] = [];
  let visibleGalaxies: string[] = [];
  let visibleRegions: string[] = [];
  const systemScaned = starSystems.find((system) => !!system.scanStartedAt);
  const isAnyBeingExplored = !!systemScaned?.id;

  // --- Entrar siempre al nivel de SISTEMAS (región del sistema natal) ---
  useEffect(() => {
    if (startingSystem) {
      setSelectedCluster(startingSystem.cluster);
      setSelectedGalaxy(startingSystem.galaxy);
      setSelectedRegion(startingSystem.region);
    }
  }, [startingSystemId]);

  // Mantener autoselecciones si solo hay 1 opción (comportamiento previo)
  useEffect(() => {
    if (visibleClusters.length === 1) setSelectedCluster(visibleClusters[0]);
  }, [visibleClusters]);

  useEffect(() => {
    if (visibleGalaxies.length === 1) setSelectedGalaxy(visibleGalaxies[0]);
  }, [visibleGalaxies]);

  useEffect(() => {
    if (visibleRegions.length === 1) setSelectedRegion(visibleRegions[0]);
  }, [visibleRegions]);

  if (!data) return null;
  if (!startingSystem) return null;

  const onCancel = () => handleCancelBuild(data.q, data.r);

  const { cluster, galaxy, region } = startingSystem;
  const antennaLevel = data
    ? data.building?.type === "ANTENNA"
      ? data.building?.level
      : data.construction
      ? data.construction.targetLevel - 1
      : 0
    : 0;

  const currentCluster = selectedCluster || cluster;
  const currentGalaxy = selectedGalaxy || galaxy;
  const currentRegion = selectedRegion || region;

  const visibleSystems = getSystemsFromRegion(
    universe,
    currentCluster,
    currentGalaxy,
    currentRegion
  ).filter((s) => s.id != startingSystemId);

  visibleClusters =
    antennaLevel >= 4 ? [...new Set(Object.values(universe).map((s) => s.cluster))] : [cluster];
  visibleGalaxies =
    antennaLevel >= 3 ? getGalaxiesFromCluster(universe, currentCluster) : [currentGalaxy];
  visibleRegions =
    antennaLevel >= 2
      ? getRegionsFromGalaxy(universe, currentCluster, currentGalaxy)
      : [currentRegion];

  // --- Util para poner la opción natal primero (si está) y evitar duplicados ---
  const placeHomeFirst = (list: string[], home: string) => {
    if (!list?.length) return list;
    const seen = new Set<string>();
    const unique = list.filter((x) => {
      if (seen.has(x)) return false;
      seen.add(x);
      return true;
    });
    if (!unique.includes(home)) return unique;
    return [home, ...unique.filter((x) => x !== home)];
  };

  // Listas con natal primero
  const clustersData = placeHomeFirst(visibleClusters, cluster);
  const galaxiesData = placeHomeFirst(visibleGalaxies, galaxy);
  const regionsData = placeHomeFirst(visibleRegions, region);

  const onBuild = () => {
    if (data.building) handleBuild(data.q, data.r, data.building.type);
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
    router.replace("/(tabs)/planet");
  };

  const getExploredCount = (ids: string[]) => {
    // Conserva la lógica original: cuenta sistemas presentes en starSystems
    const explored = ids.filter((id) => starSystems.some((s) => s.id === id));
    return `${explored.length}/${ids.length}`;
  };

  const ClusterItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => {
    const systemsInCluster = Object.values(universe).filter((s) => s.cluster === name);
    const systemIds = systemsInCluster.map((s) => s.id);
    const exploredText = getExploredCount(systemIds);
    const isHomeCluster = name === startingSystem.cluster;
    const fantasyName = universeNames.clusters[name] || name;

    return (
      <View style={commonStyles.containerCenter}>
        <ImageBackground
          source={IMAGES.BACKGROUND_CLUSTER}
          style={commonStyles.cardMini}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={commonStyles.overlayDark}>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.titleText}>
                {t("Cluster")}: {fantasyName}
              </Text>
              {isHomeCluster && <Text style={commonStyles.titleBlueText}>{t("Natal")}</Text>}
            </View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>
                {t("ExploredSystems")}: {exploredText}
              </Text>
              <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
                <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const GalaxyItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => {
    const systemsInGalaxy = Object.values(universe).filter((s) => s.galaxy === name);
    const systemIds = systemsInGalaxy.map((s) => s.id);
    const exploredText = getExploredCount(systemIds);
    const isHomeGalaxy = name === startingSystem.galaxy;
    const fantasyName = universeNames.galaxies[name] || name;

    return (
      <View style={commonStyles.containerCenter}>
        <ImageBackground
          source={IMAGES.BACKGROUND_GALAXY}
          style={commonStyles.cardMini}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={commonStyles.overlayDark}>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.titleText}>
                {t("Galaxy")}: {fantasyName}
              </Text>
              {isHomeGalaxy && <Text style={commonStyles.titleBlueText}>{t("Natal")}</Text>}
            </View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>
                {t("ExploredSystems")}: {exploredText}
              </Text>
              <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
                <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const RegionItem = ({ name, onPress, t }: { name: string; onPress: () => void; t: any }) => {
    const systemsInRegion = Object.values(universe).filter((s) => s.region === name);
    const systemIds = systemsInRegion.map((s) => s.id);
    const exploredText = getExploredCount(systemIds);
    const isHomeRegion = name === startingSystem.region;
    const fantasyName = universeNames.regions[name] || name;

    return (
      <View style={commonStyles.containerCenter}>
        <ImageBackground
          source={IMAGES.BACKGROUND_REGION}
          style={commonStyles.cardMini}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={commonStyles.overlayDark}>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.titleText}>
                {t("Region")}: {fantasyName}
              </Text>
              {isHomeRegion && <Text style={commonStyles.titleBlueText}>{t("Natal")}</Text>}
            </View>
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={commonStyles.whiteText}>
                {t("ExploredSystems")}: {exploredText}
              </Text>
              <TouchableOpacity onPress={onPress} style={commonStyles.buttonPrimary}>
                <Text style={commonStyles.buttonTextLight}>{t("Explore")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const SystemItem = ({
    system,
    onScan,
    onRecover,
    onCancelScan,
    t,
    disabled,
    beingExplored,
  }: {
    system: StarSystemDetected;
    onScan: (id: string) => void;
    onRecover: (id: string) => void;
    onCancelScan: (id: string) => void;
    t: any;
    disabled: boolean;
    beingExplored: boolean;
  }) => {
    const image = getSystemImage(system.type);
    const target = starSystems.find((s) => s.id === system.id);

    const isExplored = !!target && !target.scanStartedAt;
    const isDiscarded = !!target && !!target.discarded;

    const emblem =
      (target && target.explored && target.race && raceConfig[target.race]?.emblem) ?? undefined;
    const race = (target && target.explored && target.race && raceConfig[target.race]?.name) ?? "";

    return (
      <View style={commonStyles.containerCenter}>
        <ImageBackground
          source={image}
          style={commonStyles.cardMini}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={commonStyles.overlayDark}>
            {isExplored && emblem ? (
              <View style={commonStyles.rowSpaceBetween}>
                <Text style={commonStyles.titleText}>{system.name}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={[commonStyles.whiteText, { marginRight: 10 }]}>{race}</Text>
                  <Image source={emblem} style={styles.emblem} resizeMode="contain" />
                </View>
              </View>
            ) : (
              <Text style={commonStyles.titleText}>{system.name}</Text>
            )}

            <View style={commonStyles.actionBar}>
              {isDiscarded ? (
                <Text style={commonStyles.titleBlueText}> {t("Discarded")}</Text>
              ) : beingExplored ? (
                <Text style={commonStyles.statusTextYellow}>
                  ⏳ {t("inProgress")}:{" "}
                  <CountdownTimer
                    startedAt={systemScaned?.scanStartedAt}
                    duration={SCAN_DURATION}
                  />
                </Text>
              ) : !isExplored && disabled ? (
                <Text style={commonStyles.whiteText}>{t("ScanningProcess")}</Text>
              ) : (
                <View />
              )}
              {isDiscarded ? (
                <TouchableOpacity
                  onPress={() => onRecover(system.id)}
                  style={[commonStyles.buttonPrimary, disabled && commonStyles.buttonDisabled]}
                  disabled={disabled}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("Recover")}</Text>
                </TouchableOpacity>
              ) : isExplored ? (
                <Text style={commonStyles.titleBlueText}> {t("ExploredSystem")}</Text>
              ) : beingExplored ? (
                <TouchableOpacity
                  onPress={() => onCancelScan(system.id)}
                  style={commonStyles.cancelButton}
                >
                  <Text style={commonStyles.cancelButtonText}>{t("Cancel")}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onScan(system.id)}
                  style={[commonStyles.buttonPrimary, disabled && commonStyles.buttonDisabled]}
                  disabled={disabled}
                >
                  <Text style={commonStyles.buttonTextLight}>{t("Scan")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const BackButton = ({ onPress, text }: { onPress: () => void; text: string }) => (
    <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
      <Text style={commonStyles.closeText}>{t(text)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onClose} style={commonStyles.closeXButton}>
        <Text style={commonStyles.closeXText}>✕</Text>
      </TouchableOpacity>

      <View>{getMainArea()}</View>

      {/* Clusters (natal primero si está en la lista) */}
      {antennaLevel >= 4 && clustersData.length > 1 && !selectedCluster && (
        <FlatList
          data={clustersData}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ClusterItem
              name={item}
              onPress={() => {
                setSelectedCluster(item);
                setSelectedGalaxy(null);
                setSelectedRegion(null);
              }}
              t={t}
            />
          )}
        />
      )}

      {/* Galaxias (natal primero si pertenece al cluster actual) */}
      {antennaLevel >= 3 && galaxiesData.length > 1 && selectedCluster && !selectedGalaxy && (
        <FlatList
          data={galaxiesData}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <GalaxyItem
              name={item}
              onPress={() => {
                setSelectedGalaxy(item);
                setSelectedRegion(null);
              }}
              t={t}
            />
          )}
          ListHeaderComponent={
            clustersData.length > 1 ? (
              <BackButton onPress={() => setSelectedCluster(null)} text="Clusters" />
            ) : (
              <View style={commonStyles.backButton}>
                <Text style={[commonStyles.closeText, { fontSize: 16 }]}>
                  {t("AntennaUpgradeNeeded")}
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Regiones (natal primero si pertenece a la galaxia actual) */}
      {antennaLevel >= 2 && regionsData.length > 1 && selectedGalaxy && !selectedRegion && (
        <FlatList
          data={regionsData}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <RegionItem name={item} onPress={() => setSelectedRegion(item)} t={t} />
          )}
          ListHeaderComponent={
            galaxiesData.length > 1 ? (
              <BackButton onPress={() => setSelectedGalaxy(null)} text="Galaxys" />
            ) : (
              <View style={commonStyles.backButton}>
                <Text style={[commonStyles.closeText, { fontSize: 16 }]}>
                  {t("AntennaUpgradeNeeded")}
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Sistemas */}
      {selectedRegion && (
        <FlatList
          ref={systemsListRef}
          data={visibleSystems}
          keyExtractor={(item) => item.id}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              systemsListRef.current?.scrollToIndex({
                index: Math.min(index, visibleSystems.length - 1),
                animated: false,
              });
            }, 50);
          }}
          renderItem={({ item }) => {
            const isBeingExplored = systemScaned?.id === item.id;
            return (
              <SystemItem
                system={item}
                onScan={(id) => scanStarSystem(startingSystemId, id)}
                onRecover={(id) => recoverStarSystem(id)}
                onCancelScan={(id) => cancelScanStarSystem(id)}
                disabled={isAnyBeingExplored && !isBeingExplored}
                beingExplored={isBeingExplored}
                t={t}
              />
            );
          }}
          ListHeaderComponent={
            regionsData.length > 1 ? (
              <BackButton onPress={() => setSelectedRegion(null)} text="Regions" />
            ) : (
              <View style={commonStyles.backButton}>
                <Text style={[commonStyles.closeText, { fontSize: 16 }]}>
                  {t("AntennaUpgradeNeeded")}
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emblem: { width: 24, height: 24, borderRadius: 6 },
});
