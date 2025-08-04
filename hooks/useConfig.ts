import { deleteConfig, loadConfig, saveConfig } from "@/src/services/storage";
import { ConfigEntry, defaultPlayerConfig, PlayerConfig } from "@/src/types/configTypes";
import { useEffect, useRef, useState } from "react";

export const useConfig = () => {
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig>([]);
  const configRef = useRef<PlayerConfig>([]);

  const syncAndSave = (newConfig: PlayerConfig) => {
    configRef.current = newConfig;
    setPlayerConfig(newConfig);
    saveConfig(newConfig);
  };

  const modifyPlayerConfig = async (modifier: (prev: PlayerConfig) => PlayerConfig) => {
    const next = modifier(configRef.current);
    await syncAndSave(next);
  };

  const handleUpdateConfig = async (newEntry: ConfigEntry) => {
    await modifyPlayerConfig((prev) => {
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
    loadPlayerConfig,
    resetPlayerConfig,
    playerConfig,
  };
};
