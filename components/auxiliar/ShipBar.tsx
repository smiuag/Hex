import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { CustomShipTypeId, ShipData } from "@/src/types/shipType";
import { getSpecByType, isCustomType } from "@/utils/shipUtils";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface Props {
  ships: ShipData[];
}

export const ShipBar: React.FC<Props> = ({ ships }) => {
  const specs = useGameContextSelector((ctx) => ctx.specs);
  const { t: tShip } = useTranslation("ship");

  if (!ships || ships.length === 0) return null;

  // 1) Agrupa por (custom|type) y suma amount
  const grouped = useMemo(() => {
    const m = new Map<string, { custom: boolean; type: string; amount: number }>();
    for (const s of ships) {
      const key = (s.custom ? "1" : "0") + "|" + s.type;
      const prev = m.get(key);
      if (prev) {
        prev.amount += s.amount;
      } else {
        m.set(key, { custom: s.custom, type: s.type, amount: s.amount });
      }
    }
    return Array.from(m.values()); // respeta orden de primera aparición
  }, [ships]);

  const totalShips = useMemo(() => grouped.reduce((sum, s) => sum + (s.amount || 0), 0), [grouped]);
  const typesCount = grouped.length;

  const displayNameFor = (typeStr: string) => {
    const spec = getSpecByType(typeStr as any, specs);
    if (isCustomType(typeStr)) {
      return spec?.name ?? (typeStr as CustomShipTypeId);
    }
    return tShip(`shipName.${typeStr}`);
  };

  if (typesCount <= 1) {
    return (
      <View style={commonStyles.flex1}>
        <Text style={commonStyles.whiteText}>
          {grouped.map((g, idx) => (
            <Text key={`${g.custom ? "c" : "b"}-${g.type}`}>
              {g.amount} x {displayNameFor(g.type)}
              {idx < grouped.length - 1 ? "  •  " : ""}
            </Text>
          ))}
        </Text>
      </View>
    );
  }

  // 3) Modo resumen + desglose
  return (
    <View style={commonStyles.flex1}>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        <Text style={commonStyles.whiteText}>
          Flota de {totalShips} naves de {typesCount} tipos
        </Text>
      </View>
    </View>
  );
};
