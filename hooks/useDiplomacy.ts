import { deleteDiplomacy, loadDiplomacy, saveDiplomacy } from "@/src/services/storage";
import { DiplomacyLevel, RaceType } from "@/src/types/raceType";
import { buildDefault, normalizeToAllRaces } from "@/utils/diplomacyUtils";
import { useEffect, useRef, useState } from "react";

export const useDiplomacy = () => {
  const [playerDiplomacy, setPlayerDiplomacy] = useState<DiplomacyLevel[]>([]);
  const diplomacyRef = useRef<DiplomacyLevel[]>([]);

  const syncAndSave = async (diplomacy: DiplomacyLevel[]) => {
    const normalized = normalizeToAllRaces(diplomacy);
    diplomacyRef.current = normalized;
    setPlayerDiplomacy(normalized);
    await saveDiplomacy(normalized);
  };

  const modifyDiplomacy = async (modifier: (prev: DiplomacyLevel[]) => DiplomacyLevel[]) => {
    const next = modifier(diplomacyRef.current);
    await syncAndSave(next);
  };

  const handleModifyDiplomacy = async (race: RaceType, change: number) => {
    await modifyDiplomacy((prev) => {
      let found = false;
      const updated = prev.map((entry) => {
        if (entry.race === race) {
          found = true;
          return { ...entry, diplomacyLevel: entry.diplomacyLevel + change };
        }
        return entry;
      });
      return found ? updated : [...updated, { race, diplomacyLevel: 500 + change }];
    });
  };

  const loadPlayerDiplomacy = async () => {
    const saved = await loadDiplomacy();
    if (saved && Array.isArray(saved)) {
      await syncAndSave(saved as DiplomacyLevel[]);
    } else {
      await syncAndSave(buildDefault());
    }
  };

  const resetPlayerDiplomacy = async () => {
    await deleteDiplomacy();
    await syncAndSave(buildDefault());
  };

  useEffect(() => {
    loadPlayerDiplomacy();
  }, []);

  return {
    handleModifyDiplomacy,
    loadPlayerDiplomacy,
    resetPlayerDiplomacy,
    playerDiplomacy,
  };
};
