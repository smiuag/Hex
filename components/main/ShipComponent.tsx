import React, { useCallback, useMemo } from "react";
import { FlatList } from "react-native";
import { useGameContextSelector } from "../../src/context/GameContext";
import { commonStyles } from "../../src/styles/commonStyles";
import type { CustomShipTypeId, ShipId, ShipType } from "../../src/types/shipType";
import { ShipCard } from "../cards/ShipCard";

export default function ShipComponent() {
  const shipBuildQueue = useGameContextSelector((ctx) => ctx.shipBuildQueue);
  const handleBuildShip = useGameContextSelector((ctx) => ctx.handleBuildShip);
  const handleCancelShip = useGameContextSelector((ctx) => ctx.handleCancelShip);
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);
  const hexes = useGameContextSelector((ctx) => ctx.hexes);
  const specs = useGameContextSelector((ctx) => ctx.specs); // { builtin, customById }

  const hasSpaceStation = hexes.some((h) => h.building?.type === "SPACESTATION");

  // Construye el item estándar que espera ShipCard (tanto para builtin como custom)
  // …imports y hooks iguales…

  // Añade createdAt opcional para poder ordenar los custom entre sí
  const makeItem = useCallback(
    (
      type: ShipId,
      cfg: {
        name?: string;
        imageBackground: any;
        baseBuildTime: number;
        baseCost: Record<string, number>;
        productionFacility: string;
        orden?: number;
        attack?: number;
        defense?: number;
        speed?: number;
        hp?: number;
        isCustom?: boolean;
        createdAt?: number; // 👈
      }
    ) => {
      const queueItem = shipBuildQueue.find((f) => f.type === type);
      const owned = queueItem?.amount ?? 0;
      const inProgress = !!queueItem?.progress;
      const remainingAmount = queueItem?.progress?.targetAmount ?? 0;
      const startedAt = queueItem?.progress?.startedAt ?? 0;
      const totalTime = cfg.baseBuildTime * remainingAmount;

      return {
        key: String(type),
        type,
        imageBackground: cfg.imageBackground,
        owned,
        inProgress,
        remainingAmount,
        startedAt,
        totalTime,
        cost: cfg.baseCost,
        canBuild: enoughResources(cfg.baseCost),
        unitTime: cfg.baseBuildTime,
        isCustom: !!cfg.isCustom,
        name: cfg.name,
        attack: cfg.attack,
        defense: cfg.defense,
        speed: cfg.speed,
        hp: cfg.hp,
        orden: cfg.orden,
        createdAt: cfg.createdAt, // 👈
        show: cfg.productionFacility === "HANGAR" || hasSpaceStation,
      };
    },
    [shipBuildQueue, enoughResources, hasSpaceStation]
  );

  const shipItems = useMemo(() => {
    const builtin = Object.entries(specs.builtin).map(([key, cfg]) =>
      makeItem(key as ShipType, {
        imageBackground: cfg.imageBackground,
        baseBuildTime: cfg.baseBuildTime,
        baseCost: cfg.baseCost as any,
        productionFacility: cfg.productionFacility,
        orden: cfg.orden,
        isCustom: false,
      })
    );

    const custom = Object.values(specs.customById).map((spec) =>
      makeItem(spec.id as CustomShipTypeId, {
        name: spec.name,
        imageBackground: spec.imageBackground,
        baseBuildTime: spec.baseBuildTime,
        baseCost: spec.baseCost as any,
        productionFacility: spec.productionFacility,
        orden: spec.orden,
        isCustom: true,
        attack: spec.attack,
        defense: spec.defense,
        speed: spec.speed,
        hp: spec.hp,
        createdAt: spec.createdAt, // 👈
      })
    );

    const builtVisible = builtin
      .filter((i) => i.show)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    const customVisible = custom
      .filter((i) => i.show)
      // reciente primero dentro de custom (cámbialo si quieres por nombre)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    // 👇 custom siempre al final
    return [...builtVisible, ...customVisible];
  }, [specs.builtin, specs.customById, makeItem]);

  return (
    <FlatList
      data={shipItems}
      keyExtractor={(item) => item.key}
      contentContainerStyle={commonStyles.flatList}
      renderItem={({ item }) => (
        <ShipCard item={item} onBuild={handleBuildShip} onCancel={handleCancelShip} />
      )}
    />
  );
}
