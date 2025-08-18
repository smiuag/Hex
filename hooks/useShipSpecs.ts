import { shipConfig } from "@/src/config/shipConfig";
import { loadCustomSpecs, saveCustomSpecs } from "@/src/services/shipSpecsStorage";
import { CustomShipSpec, CustomSpecMap, ShipSpecsCtx } from "@/src/types/shipType";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useShipSpecs = () => {
  const [customSpecs, setCustomSpecs] = useState<CustomSpecMap>({});
  const customRef = useRef<CustomSpecMap>({});

  const saveChain = useRef(Promise.resolve());
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const snapshot = customRef.current;
    saveChain.current = saveChain.current
      .then(() => saveCustomSpecs(snapshot))
      .catch((e) => console.error("Error saving custom specs:", e));
  }, [customSpecs]);

  const loadData = useCallback(async () => {
    const saved = await loadCustomSpecs();
    customRef.current = saved;
    setCustomSpecs(saved);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const modifyCustom = (
    modifier:
      | ((prev: CustomSpecMap) => CustomSpecMap)
      | ((prev: CustomSpecMap) => { next: CustomSpecMap; changed?: boolean })
  ) => {
    setCustomSpecs((prev) => {
      const result = (modifier as any)(prev);
      const next: CustomSpecMap = (result as any)?.next ?? (result as CustomSpecMap);
      if (next === prev) return prev;
      customRef.current = next;
      return next;
    });
  };

  const upsertSpec = useCallback((spec: CustomShipSpec) => {
    modifyCustom((prev) => ({ ...prev, [spec.id]: spec }));
  }, []);

  const resetSpecs = useCallback(() => modifyCustom(() => ({})), []);

  const specs: ShipSpecsCtx = useMemo(
    () => ({ builtin: shipConfig, customById: customSpecs }),
    [customSpecs]
  );

  return {
    specs,
    resetSpecs,
    upsertSpec,
  };
};
