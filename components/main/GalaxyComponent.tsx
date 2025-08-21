import { resourceEmojis } from "@/src/config/emojisConfig";
import { raceConfig } from "@/src/config/raceConfig";
import { IMAGES } from "@/src/constants/images";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";
import { StatusKey } from "@/src/types/starSystemTypes";
import { getSystemBuildings, getSystemResources } from "@/utils/starSystemUtils";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, ImageBackground, Text } from "react-native";
import StarSystemFilterBar, { MatchMode3 } from "../auxiliar/SystemSelector";
import { SystemDefendedCard } from "../cards/SystemDefendedCard";
import { SystemExploredCard } from "../cards/SystemExploredCard";
import { SystemUnknownCard } from "../cards/SystemUnkownCard";

export default function StarSystemComponent() {
  const { t } = useTranslation("common");
  const starSystems = useGameContextSelector((ctx) => ctx.starSystems);

  const discardStarSystem = useGameContextSelector((ctx) => ctx.discardStarSystem);
  const cancelExplorePlanet = useGameContextSelector((ctx) => ctx.cancelExplorePlanet);
  const starPortStartBuild = useGameContextSelector((ctx) => ctx.starPortStartBuild);
  const defenseStartBuild = useGameContextSelector((ctx) => ctx.defenseStartBuild);
  const extractionStartBuild = useGameContextSelector((ctx) => ctx.extractionStartBuild);
  const cancelAttack = useGameContextSelector((ctx) => ctx.cancelAttack);
  const startCollectSystem = useGameContextSelector((ctx) => ctx.startCollectSystem);
  const cancelExploreSystem = useGameContextSelector((ctx) => ctx.cancelExploreSystem);
  const cancelCollect = useGameContextSelector((ctx) => ctx.cancelCollect);
  const startCelestialBodyExploration = useGameContextSelector(
    (ctx) => ctx.startCelestialBodyExploration
  );
  const playerDiplomacy = useGameContextSelector(
    (ctx) => ctx.playerDiplomacy
  ) as readonly DiplomacyLevel[];
  const startStarSystemExploration = useGameContextSelector(
    (ctx) => ctx.startStarSystemExploration
  );

  // -------- Filtros (estado aplicado) --------
  const [raceSel, setRaceSel] = useState<Set<string>>(new Set());
  const [resSel, setResSel] = useState<Set<string>>(new Set());
  const [bldSel, setBldSel] = useState<Set<string>>(new Set());
  const [statusSel, setStatusSel] = useState<Set<string>>(new Set()); // usar string para evitar problemas de varianza

  const [resMode, setResMode] = useState<MatchMode3>("off");
  const [bldMode, setBldMode] = useState<MatchMode3>("off");
  const [statusMode] = useState<MatchMode3>("any"); // status se interpreta como "Alguno" (si vacío => sin filtro)

  const exploredSystems = useMemo(
    () => starSystems.filter((s) => !s.scanStartedAt && !s.discarded),
    [starSystems]
  );

  const allyIds = useMemo(
    () =>
      playerDiplomacy
        .filter((pd) => pd.discovered && pd.diplomacyLevel >= 500)
        .map((pd) => pd.race as string),
    [playerDiplomacy]
  );

  const hostileIds = useMemo(
    () =>
      playerDiplomacy
        .filter((pd) => pd.discovered && pd.diplomacyLevel < 500)
        .map((pd) => pd.race as string),
    [playerDiplomacy]
  );
  // -------- Opciones --------
  const raceOptions = useMemo(() => {
    const base = playerDiplomacy
      .filter((d) => d.discovered)
      .map((d) => ({
        id: d.race as string,
        label: raceConfig[d.race as RaceType]?.name ?? (d.race as string),
        image: raceConfig[d.race as RaceType]?.emblem,
      }));
    return [{ id: "__NO_OWNER__", label: "Sin dueño", image: IMAGES.RACE_DEFAULT }, ...base];
  }, [playerDiplomacy]);

  const resourceOptions = useMemo(
    () =>
      Object.entries(resourceEmojis)
        .filter(([k]) => k !== "ENERGY")
        .map(([k, emoji]) => ({
          id: k,
          emoji,
          label: k.charAt(0) + k.slice(1).toLowerCase(),
        })),
    []
  );

  const buildingOptions = useMemo(
    () => [
      { id: "STARPORT", label: "Puerto estelar", emoji: "🛰️" },
      { id: "DEFENSE", label: "Sistema de defensa", emoji: "🛡️" },
      { id: "EXTRACTION", label: "Sistema de extracción", emoji: "🛸" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { id: "ARMED", label: "Con naves", emoji: "🚀" },
      { id: "EXPLORED", label: "Explorados", emoji: "🔭" },
      { id: "DEFENDED", label: "Defendidos", emoji: "🛡️" },
      { id: "UNEXPLORED", label: "Sin explorar", emoji: "🌑" },
    ],
    []
  );

  // -------- Filtrado --------
  const filtered = useMemo(() => {
    const matchWithMode = (mode: MatchMode3, selected: Set<string>, haystack: string[]) => {
      if (mode === "off" || selected.size === 0) return true; // sin filtro
      return mode === "all"
        ? [...selected].every((id) => haystack.includes(id))
        : haystack.some((id) => selected.has(id));
    };

    return exploredSystems.filter((sys) => {
      // Raza
      const sysRace: string | undefined = (sys as any).race;
      const raceOk =
        raceSel.size === 0 ||
        (sysRace && raceSel.has(sysRace)) ||
        (!sysRace && raceSel.has("__NO_OWNER__"));

      // Recursos (keys de cuerpos explorados)
      const sysResources = getSystemResources(sys);
      const resOk = matchWithMode(resMode, resSel, sysResources);

      // Edificios
      const sysBuildings = getSystemBuildings(sys);
      const bldOk = matchWithMode(bldMode, bldSel, sysBuildings);

      // --- NUEVO: ¿Tiene naves del jugador en el sistema?
      const isArmed =
        Array.isArray((sys as any).playerShips) && (sys as any).playerShips.length > 0;

      // Estado (siempre "Alguno"; si vacío => sin filtro)
      const baseStatus: StatusKey[] = sys.explored
        ? sys.conquered
          ? ["EXPLORED"]
          : ["EXPLORED", "DEFENDED"]
        : ["UNEXPLORED"];

      // --- NUEVO: añade "ARMED" si corresponde
      const sysStatus: StatusKey[] = isArmed ? [...baseStatus, "ARMED"] : baseStatus;

      const statusOk = statusSel.size === 0 ? true : sysStatus.some((s) => statusSel.has(s));

      return raceOk && resOk && bldOk && statusOk;
    });
  }, [exploredSystems, raceSel, resSel, bldSel, statusSel, resMode, bldMode]);

  const onDiscard = (id: string) => {
    Alert.alert("💀 ¡Alerta!", "¿Estás seguro de que quieres descartar este sistema?", [
      { text: t("cancel"), style: "cancel" },
      { text: t("confirm"), style: "destructive", onPress: async () => discardStarSystem(id) },
    ]);
  };

  if (exploredSystems.length === 0) {
    return (
      <ImageBackground
        source={IMAGES.BACKGROUND_QUEST_IMAGE}
        style={[commonStyles.flexCenter, { padding: 24, flex: 1 }]}
        imageStyle={{ resizeMode: "cover", opacity: 0.4 }}
      >
        <Text style={commonStyles.titleText}>{t("VoidExplorationScreenTitle")}</Text>
        <Text style={commonStyles.subtitleText}>{t("VoidExplorationScreenSubTitle")}</Text>
      </ImageBackground>
    );
  }

  const filteredSorted = useMemo(
    () => [...filtered].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
    [filtered]
  );

  return (
    <FlatList
      contentContainerStyle={commonStyles.flatList}
      data={filteredSorted}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <StarSystemFilterBar
          // estado aplicado (el único que cuenta para marcar iconos)
          raceSel={raceSel}
          resSel={resSel}
          bldSel={bldSel}
          statusSel={statusSel}
          resMode={resMode}
          bldMode={bldMode}
          statusMode={statusMode}
          // aplicar al padre
          onApplyRaces={(sel) => setRaceSel(sel)}
          onApplyResources={(sel, mode) => {
            setResSel(sel);
            setResMode(mode);
          }}
          onApplyBuildings={(sel, mode) => {
            setBldSel(sel);
            setBldMode(mode);
          }}
          onApplyStatus={(sel) => setStatusSel(sel)}
          // toggles aliadas/hostiles -> define después la lógica y te las conecto
          onQuickAlliesSelect={() => allyIds}
          onQuickHostilesSelect={() => hostileIds}
          options={{
            races: raceOptions,
            resources: resourceOptions,
            buildings: buildingOptions,
            status: statusOptions,
          }}
        />
      }
      // Asegura que el header quede por encima (Android/iOS)
      ListHeaderComponentStyle={{ zIndex: 1000, elevation: 20 }}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) =>
        item.conquered ? (
          <SystemExploredCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onExplorePlanet={startCelestialBodyExploration}
            onCancelExplorePlanet={cancelExplorePlanet}
            onStarPortBuild={starPortStartBuild}
            onDefenseStartBuild={defenseStartBuild}
            onExtractionStartBuild={extractionStartBuild}
            onStartCollectSystem={startCollectSystem}
            onCancelCollectSystem={cancelCollect}
          />
        ) : item.explored ? (
          <SystemDefendedCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onCancelAttack={cancelAttack}
          />
        ) : (
          <SystemUnknownCard
            key={item.id}
            system={item}
            onDiscard={onDiscard}
            onExplore={startStarSystemExploration}
            onCancelExploreSystem={cancelExploreSystem}
          />
        )
      }
    />
  );
}
