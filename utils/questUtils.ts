import { Research } from "@/src/types/researchTypes";
import { questConfig } from "../src/config/questConfig";
import { Hex } from "../src/types/hexTypes";
import { QuestType } from "../src/types/questType";
import { Ship } from "../src/types/shipType";

export function shouldShowQuest(questType: QuestType, completedQuests: QuestType[]): boolean {
  const config = questConfig[questType];
  if (!config) return false;

  //const isCompleted = completedQuests.includes(questType);
  const hasRequirements = config.requiredQuest.every((req) => completedQuests.includes(req));

  //return !isCompleted && hasRequirements;
  return hasRequirements;
}

export function canCompleteQuest(
  type: QuestType,
  hexes: Hex[],
  research: Research[],
  ship: Ship[]
): boolean {
  switch (type) {
    case "START":
      return true;
    case "BUILDING_KRYSTALMINE1":
      return hexes.some((hex) => hex.building?.type === "KRYSTALMINE");
    case "BUILDING_METALLURGY1":
      return hexes.some((hex) => hex.building?.type === "METALLURGY");
    case "BUILDING_QUARRY1":
      return hexes.some((hex) => hex.building?.type === "QUARRY");
    case "BUILDING_LAB1":
      return hexes.some((hex) => hex.building?.type === "LAB");
    case "RESEARCH_MINING1":
      return research.some((r) => r.data.type == "MINING" && !r.progress);
    case "BUILDING_ANTENNA":
      return hexes.some((hex) => hex.building?.type === "ANTENNA");
    case "BUILDING_BASE2":
      return hexes.some((hex) => hex.building?.type === "BASE" && hex.building.level > 1);
    case "BUILDING_HANGAR":
      return hexes.some((hex) => hex.building?.type === "HANGAR");
    case "SHIP_FIRST":
      return ship.length > 0;
    case "ALIEN_TECH_FOUND":
      return ship.length > 0;
    case "H2O_FOUND":
      return ship.length > 0;
    case "H2O_SEARCH":
      return ship.length > 0;
  }
}
