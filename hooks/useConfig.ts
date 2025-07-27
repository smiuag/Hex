import { useEffect, useState } from "react";
import { deleteConfig, loadConfig, saveConfig } from "../src/services/storage";
import { ConfigEntry, defaultPlayerConfig, PlayerConfig } from "../src/types/configTypes";

export const useConfig = () => {
  const [playerConfig, setPlayerConfig] = useState(defaultPlayerConfig);

  const updatePlayerConfig = async (config: PlayerConfig) => {
    setPlayerConfig(config);
    await saveConfig(config);
  };

  const loadPlayerConfig = async () => {
    const saved = await loadConfig();
    if (saved) {
      setPlayerConfig(saved);
    }
  };

  const resetPlayerConfig = async () => {
    await deleteConfig();
    await setPlayerConfig(defaultPlayerConfig);
  };

  useEffect(() => {
    loadPlayerConfig();
  }, []);

  function handleUpdateConfig(newEntry: ConfigEntry) {
    setPlayerConfig((prev) => {
      const exists = prev.find((c) => c.key === newEntry.key);
      let updatedConfig;
      if (exists) {
        updatedConfig = prev.map((c) => (c.key === newEntry.key ? newEntry : c));
      } else {
        updatedConfig = [...prev, newEntry];
      }

      saveConfig(updatedConfig);

      return updatedConfig;
    });
  }

  return {
    handleUpdateConfig,
    updatePlayerConfig,
    loadPlayerConfig,
    resetPlayerConfig,
    playerConfig,
  };
};
