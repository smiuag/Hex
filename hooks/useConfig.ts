import { deleteConfig, loadConfig, saveConfig } from "@/src/services/storage";
import { ConfigEntry, defaultPlayerConfig, PlayerConfig } from "@/src/types/configTypes";
import { useEffect, useRef, useState } from "react";

export const useConfig = () => {
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig>(defaultPlayerConfig);
  const configRef = useRef<PlayerConfig>(defaultPlayerConfig);

  const syncAndSave = (newConfig: PlayerConfig) => {
    configRef.current = newConfig;
    setPlayerConfig(newConfig);
    saveConfig(newConfig);
  };

  const updatePlayerConfig = async (
    updater: PlayerConfig | ((prev: PlayerConfig) => PlayerConfig)
  ) => {
    const updated = typeof updater === "function" ? updater(configRef.current) : updater;
    syncAndSave(updated);
  };

  const handleUpdateConfig = async (newEntry: ConfigEntry) => {
    await updatePlayerConfig((prev) => {
      const exists = prev.find((c) => c.key === newEntry.key);
      if (exists) {
        return prev.map((c) => (c.key === newEntry.key ? newEntry : c));
      } else {
        return [...prev, newEntry];
      }
    });
  };

  const loadPlayerConfig = async () => {
    const saved = await loadConfig();
    if (saved) {
      syncAndSave(saved);
    }
  };

  const resetPlayerConfig = async () => {
    await deleteConfig();
    syncAndSave(defaultPlayerConfig);
  };

  useEffect(() => {
    loadPlayerConfig();
  }, []);

  return {
    handleUpdateConfig,
    updatePlayerConfig,
    loadPlayerConfig,
    resetPlayerConfig,
    playerConfig,
  };
};
