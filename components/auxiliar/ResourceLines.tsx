import { resourceEmojis } from "@/src/config/emojisConfig";
import { NORMAL_KEYS, type CombinedResources } from "@/src/types/resourceTypes";
import { formatAmount } from "@/utils/generalUtils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ResourceLines({ cost }: { cost: Partial<CombinedResources> }) {
  const entries = Object.entries(cost);
  const normal = entries.filter(([k]) => NORMAL_KEYS.has(k));
  const special = entries.filter(([k]) => !NORMAL_KEYS.has(k));

  const fmtNormal = (k: string, v: number | unknown) =>
    `${resourceEmojis[k as keyof typeof resourceEmojis] ?? ""}  ${formatAmount(
      Math.round((v as number) ?? 0)
    )} ${k}`;

  const fmtSpecial = (k: string, v: number | unknown) =>
    `${k} ${formatAmount(Math.round((v as number) ?? 0))} ${
      resourceEmojis[k as keyof typeof resourceEmojis] ?? ""
    }`;

  if (!entries.length) return <Text style={styles.text}>-</Text>;

  return (
    <View style={styles.costRow}>
      <View style={{ flex: 1 }}>
        {normal.map(([k, v]) => (
          <Text key={k} style={styles.text}>
            {fmtNormal(k, v)}
          </Text>
        ))}
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        {special.map(([k, v]) => (
          <Text key={k} style={styles.text}>
            {fmtSpecial(k, v)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: "#E6F1FF" },
  costRow: { flexDirection: "row", gap: 12, marginTop: 6 },
});
