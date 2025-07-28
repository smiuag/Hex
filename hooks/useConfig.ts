import { useEffect, useState } from "react";
import { deleteConfig, loadConfig, saveConfig } from "../src/services/storage";
import { ConfigEntry, defaultPlayerConfig, PlayerConfig } from "../src/types/configTypes";

export const useConfig = () => {
  const [playerConfig, setPlayerConfig] = useState(defaultPlayerConfig);

  // Actualiza el estado con función o array, y guarda
  const updatePlayerConfig = async (
    updater: PlayerConfig | ((prev: PlayerConfig) => PlayerConfig)
  ) => {
    const updated = typeof updater === "function" ? updater(playerConfig) : updater;
    setPlayerConfig(updated);
    await saveConfig(updated);
  };

  const loadPlayerConfig = async () => {
    const saved = await loadConfig();
    if (saved) {
      setPlayerConfig(saved);
    }
  };

  const resetPlayerConfig = async () => {
    setPlayerConfig(defaultPlayerConfig);
    await deleteConfig();
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
