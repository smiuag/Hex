import { resourceEmojis } from "@/src/config/emojisConfig";
import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { DiplomaticEvent, EventOption } from "@/src/types/eventTypes";
import { CombinedResources, CombinedResourcesType } from "@/src/types/resourceTypes";
import {
  generateDiplomacyChangeDescription,
  generateSabotageDescription,
  getOptionDescription,
} from "@/utils/eventUtil";
import { formatAmount } from "@/utils/generalUtils";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CountdownTimer } from "../auxiliar/CountdownTimer";

export default function OptionCard({
  diplomaticEvent,
  option,
  onChoose,
}: {
  diplomaticEvent: DiplomaticEvent;
  option: EventOption;
  onChoose?: (option: EventOption) => void;
}) {
  const { t } = useTranslation("common");
  const { t: tEvent } = useTranslation("events");
  const { t: tShip } = useTranslation("ship");
  const enoughResources = useGameContextSelector((ctx) => ctx.enoughResources);

  const offeredResources: React.ReactNode[] = [];
  const requestedResources: React.ReactNode[] = [];
  const offeredShips: React.ReactNode[] = [];
  const requestedShips: React.ReactNode[] = [];
  const effectsDescriptionList: React.ReactNode[] = [];
  const specialOffer: React.ReactNode[] = [];

  let showTrade = false;
  let showdiplomacy = false;
  let availableByResources = true;
  let effectsDescription = "";

  option.effects.forEach((effect) => {
    if (effect.trade?.resourceChange) {
      const cost: Partial<CombinedResources> = {};
      for (const [k, v] of Object.entries(effect.trade.resourceChange)) {
        const num = typeof v === "number" ? v : 0;
        if (num < 0) {
          const key = k as keyof CombinedResources;
          cost[key] = (cost[key] ?? 0) + Math.abs(num);
        }
      }
      if (Object.keys(cost).length && !enoughResources(cost)) {
        availableByResources = false;
      }

      showTrade = true;
      Object.entries(effect.trade.resourceChange).forEach(([k, v]) => {
        const n = v as number;
        const sign = n > 0 ? "+" : "";
        if (n < 0) {
          offeredResources.push(
            <Text key={k} style={[styles.compItem, styles.neg]}>
              {resourceEmojis[k as CombinedResourcesType]} {sign}
              {formatAmount(n)}
            </Text>
          );
        } else if (n > 0) {
          requestedResources.push(
            <Text key={k} style={[styles.compItem, styles.pos]}>
              {resourceEmojis[k as CombinedResourcesType]} {sign}
              {formatAmount(n)}
            </Text>
          );
        }
      });
    }

    if (effect.trade?.shipChange?.length) {
      showTrade = true;
      effect.trade.shipChange.forEach((ship) => {
        const name = tShip(`shipName.${ship.type}`);
        if (ship.amount < 0) {
          offeredShips.push(
            <Text key={ship.type} style={[styles.compItem, styles.neg]}>
              {name} -{ship.amount}
            </Text>
          );
        } else if (ship.amount > 0) {
          requestedShips.push(
            <Text key={ship.type} style={[styles.compItem, styles.pos]}>
              {name} +{ship.amount}
            </Text>
          );
        }
      });
    }

    if (effect.diplomacy) {
      showdiplomacy = true;
      effect.diplomacy.forEach((ef) => {
        effectsDescription += generateDiplomacyChangeDescription(
          tEvent as unknown as (key: string, options?: object) => string,
          ef
        );
      });

      effectsDescriptionList.push(
        <View
          key="diplomaticView"
          style={[styles.compItemsWrap, { flex: 1, alignItems: "flex-start" }]}
        >
          <Text style={styles.optDesc}>{effectsDescription}</Text>
        </View>
      );
    }

    if (effect.sabotage) {
      showdiplomacy = true;

      effectsDescription += generateSabotageDescription(
        tEvent as unknown as (key: string, options?: object) => string
      );

      effectsDescriptionList.push(
        <View
          key="diplomaticView"
          style={[styles.compItemsWrap, { flex: 1, alignItems: "flex-start" }]}
        >
          <Text style={styles.optDesc}>{effectsDescription}</Text>
        </View>
      );
    }

    if (effect.trade?.specialReward === true) {
      showTrade = true;
      const specialReward = (
        <Text key="specialReward" style={[styles.compItem, styles.specialChip]}>
          {t("specialReward")}
        </Text>
      );
      specialOffer.push(specialReward);
    }
  });

  const optionDescription = getOptionDescription(
    tEvent as unknown as (key: string, options?: object) => string,
    tShip as unknown as (key: string, options?: object) => string,
    option.type,
    diplomaticEvent
  );
  const remainingDuration = diplomaticEvent.endTime - Date.now();

  return (
    <View style={[styles.optCard, { marginTop: 5 }]}>
      {optionDescription && <Text style={styles.optDesc}>{optionDescription}</Text>}

      {!!option.effects && (
        <View key="tradeView" style={styles.compactBlock}>
          <View key="trade" style={[styles.compRow, { alignItems: "flex-start" }]}>
            <View style={[styles.compItemsWrap, { flex: 1, alignItems: "flex-start" }]}>
              {requestedResources}
              {requestedShips}
              {specialOffer}
            </View>

            <View style={[styles.compItemsWrap, { flex: 1, alignItems: "flex-start" }]}>
              {offeredResources}
              {offeredShips}
            </View>
          </View>
        </View>
      )}

      <View>
        {effectsDescriptionList ? (
          <View key="diplomacy">
            <Text>{effectsDescriptionList}</Text>
          </View>
        ) : (
          <View key="noEffect" style={{ marginBottom: 5 }}>
            <Text style={styles.optDesc}>Sin efectos</Text>
          </View>
        )}

        {onChoose && (
          <View style={[commonStyles.actionBar, { marginTop: 0 }]}>
            <Text style={commonStyles.statusTextYellow}>
              ⏳ <CountdownTimer startedAt={Date.now()} duration={remainingDuration} />
            </Text>
            <TouchableOpacity
              style={[
                commonStyles.buttonPrimary,
                !availableByResources && commonStyles.buttonDisabled,
              ]}
              onPress={() => onChoose(option)}
              disabled={!availableByResources}
            >
              <Text style={[commonStyles.buttonTextLight]}>{t(`${option.type}`)}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  emblem: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 3,
  },
  optionsScroll: {
    marginTop: 2,
    maxHeight: 380,
  },
  optCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
    marginBottom: 10,
  },
  optDesc: { color: "#9fb1c7", marginBottom: 6, lineHeight: 18 },

  compactBlock: {
    gap: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  compRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 2 },
  compLabel: { color: "#cbd5e1", fontWeight: "600", marginRight: 6, fontSize: 12 },
  compItemsWrap: { flexDirection: "row", flexWrap: "wrap" },
  compItem: {
    color: "#cbd5e1",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
    marginRight: 6,
    marginBottom: 4,
    minWidth: 150,
  },
  specialChip: {
    backgroundColor: "rgba(253,224,71,0.2)",
    color: "#fde68a",
    fontWeight: "700",
  },
  pos: { color: "#22c55e", fontWeight: "700" },
  neg: { color: "#ef4444", fontWeight: "700" },
  dim: { color: "#94a3b8" },
});
