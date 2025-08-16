import { getCombatResults } from "@/src/services/combatStorage";
import { commonStyles } from "@/src/styles/commonStyles";
import type { CombatResult, CombatResultsPage } from "@/src/types/combatResultTypes";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import CombatCard from "../cards/CombatCard";

export default function CombatResultList() {
  const isFocused = useIsFocused();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<CombatResult[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const PAGE_SIZE = 10;

  const loadPage = useCallback(async (pageToLoad: number, mode: "append" | "replace") => {
    setLoading(true);
    try {
      const res: CombatResultsPage = await getCombatResults(pageToLoad, PAGE_SIZE);
      setHasMore(res.hasMore);
      setPage(res.page);
      if (mode === "replace") setItems(res.items);
      else
        setItems((prev) => [
          ...prev,
          ...res.items.filter((it) => !prev.some((p) => p.id === it.id)),
        ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setExpanded({});
    await loadPage(1, "replace");
    setRefreshing(false);
  }, [loadPage]);

  useEffect(() => {
    if (isFocused) loadPage(1, "replace");
  }, [isFocused, loadPage]);

  const onEndReached = useCallback(async () => {
    if (!loading && hasMore) await loadPage(page + 1, "append");
  }, [loading, hasMore, page, loadPage]);

  if (!isFocused) return null;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={commonStyles?.flatList}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        loading ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#8b93a3" }}>No hay combates todavía.</Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <CombatCard
          item={item}
          expanded={!!expanded[item.id]}
          onToggle={() => setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))}
        />
      )}
    />
  );
}
