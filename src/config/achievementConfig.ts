// src/config/achievementConfig.ts
import { AchievementConfig } from "@/src/types/achievementTypes";

export const achievementConfig: AchievementConfig[] = [
  // ============= PROGRESSION (10) =============
  {
    id: "TUTORIAL_COMPLETE",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "tutorialComplete.title",
        descKey: "tutorialComplete.desc",
        points: 5,
      },
    ],
  },
  {
    id: "ESTABLISH_COLONY",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "counter", key: "ESTABLISH_COLONY" },
    tiers: [
      {
        tier: 1,
        threshold: 5,
        titleKey: "establishColony.t1.title",
        descKey: "establishColony.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 25,
        titleKey: "establishColony.t2.title",
        descKey: "establishColony.t2.desc",
        points: 5,
      },
      {
        tier: 3,
        threshold: 100,
        titleKey: "establishColony.t3.title",
        descKey: "establishColony.t3.desc",
        points: 5,
      },
    ],
  },
  {
    id: "BASE_LEVEL_2",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "baseLevel2.title",
        descKey: "baseLevel2.desc",
        points: 5,
      },
    ],
  },
  {
    id: "BASE_LEVEL_3",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "baseLevel3.title",
        descKey: "baseLevel3.desc",
        points: 10,
      },
    ],
  },
  {
    id: "SHIPS_BUILT",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "counter", key: "SHIPS_BUILT" },
    tiers: [
      {
        tier: 1,
        threshold: 15,
        titleKey: "firstShipBuilt.t1.title",
        descKey: "firstShipBuilt.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 150,
        titleKey: "firstShipBuilt.t2.title",
        descKey: "firstShipBuilt.t2.desc",
        points: 5,
      },
      {
        tier: 3,
        threshold: 1000,
        titleKey: "firstShipBuilt.t3.title",
        descKey: "firstShipBuilt.t3.desc",
        points: 5,
      },
    ],
  },
  {
    id: "SYSTEMS_SCANNED",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "counter", key: "SYSTEMS_SCANNED" },
    tiers: [
      {
        tier: 1,
        threshold: 10,
        titleKey: "firstScan.t1.title",
        descKey: "firstScan.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 50,
        titleKey: "firstScan.t2.title",
        descKey: "firstScan.t2.desc",
        points: 5,
      },
      {
        tier: 3,
        threshold: 500,
        titleKey: "firstScan.t3.title",
        descKey: "firstScan.t3.desc",
        points: 5,
      },
    ],
  },
  {
    id: "ESTABLISH_EMBASSY",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "establishEmbassy.title",
        descKey: "establishEmbassy.desc",
        points: 10,
      },
    ],
  },
  {
    id: "FIRST_SYSTEM_EXPLORED",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "firstSystemExplored.title",
        descKey: "firstSystemExplored.desc",
        points: 10,
      },
    ],
  },
  {
    id: "STARPORT_BUILT",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "starportBuilt.title",
        descKey: "starportBuilt.desc",
        points: 10,
      },
    ],
  },
  {
    id: "DEFENSES_ONLINE",
    category: "PROGRESSION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "defensesOnline.title",
        descKey: "defensesOnline.desc",
        points: 10,
      },
    ],
  },

  // ============= ECONOMY (10) =============
  {
    id: "MINERALS_COLLECTED",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "MINERALS_COLLECTED" },
    tiers: [
      {
        tier: 1,
        threshold: 10_000,
        titleKey: "miner.t1.title",
        descKey: "miner.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 100_000,
        titleKey: "miner.t2.title",
        descKey: "miner.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 1_000_000,
        titleKey: "miner.t3.title",
        descKey: "miner.t3.desc",
        points: 20,
      },
      {
        tier: 4,
        threshold: 10_000_000,
        titleKey: "miner.t4.title",
        descKey: "miner.t4.desc",
        points: 20,
      },
      {
        tier: 5,
        threshold: 1_000_000_000,
        titleKey: "miner.t5.title",
        descKey: "miner.t5.desc",
        points: 20,
      },
    ],
  },
  {
    id: "ENERGY_PRODUCED_TOTAL",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "ENERGY_PRODUCED" },
    tiers: [
      {
        tier: 1,
        threshold: 50_000,
        titleKey: "energy.t1.title",
        descKey: "energy.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 500_000,
        titleKey: "energy.t2.title",
        descKey: "energy.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 5_000_000,
        titleKey: "energy.t3.title",
        descKey: "energy.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "SPECIAL_RESOURCES_COLLECTED_TOTAL",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "SPECIAL_RESOURCES_COLLECTED_TOTAL" },
    tiers: [
      {
        tier: 1,
        threshold: 5_000,
        titleKey: "specialResources.t1.title",
        descKey: "specialResources.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 50_000,
        titleKey: "specialResources.t2.title",
        descKey: "specialResources.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 500_000,
        titleKey: "specialResources.t3.title",
        descKey: "specialResources.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "QUARRIES_BUILT_TOTAL",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "QUARRIES_BUILT" },
    tiers: [
      {
        tier: 1,
        threshold: 2,
        titleKey: "quarries.t1.title",
        descKey: "quarries.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 4,
        titleKey: "quarries.t2.title",
        descKey: "quarries.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 7,
        titleKey: "quarries.t3.title",
        descKey: "quarries.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "METALLURGY_BUILT_TOTAL",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "METALLURGY_BUILT" },
    tiers: [
      {
        tier: 1,
        threshold: 2,
        titleKey: "metallurgy.t1.title",
        descKey: "metallurgy.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 4,
        titleKey: "metallurgy.t2.title",
        descKey: "metallurgy.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 7,
        titleKey: "metallurgy.t3.title",
        descKey: "metallurgy.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "BUILDINGS_UPGRADED_TOTAL",
    category: "ECONOMY",
    secret: false,
    metric: { kind: "counter", key: "BUILDINGS_UPGRADED" },
    tiers: [
      {
        tier: 1,
        threshold: 10,
        titleKey: "upgrades.t1.title",
        descKey: "upgrades.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 50,
        titleKey: "upgrades.t2.title",
        descKey: "upgrades.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 200,
        titleKey: "upgrades.t3.title",
        descKey: "upgrades.t3.desc",
        points: 20,
      },
    ],
  },

  // ============= SCIENCE (10) =============
  {
    id: "FIRST_LAB",
    category: "SCIENCE",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      { tier: 1, threshold: 1, titleKey: "firstLab.title", descKey: "firstLab.desc", points: 10 },
    ],
  },
  {
    id: "FIRST_RESEARCH",
    category: "SCIENCE",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "research.firstResearch1.title",
        descKey: "research.firstResearch1.desc",
        points: 5,
      },
    ],
  },
  {
    id: "ALIEN_TECH_ANALYZED",
    category: "SCIENCE",
    secret: true,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "alienTechAnalyzed.title",
        descKey: "alienTechAnalyzed.desc",
        points: 15,
      },
    ],
  },
  {
    id: "RESEARCH_PROJECTS_COMPLETED",
    category: "SCIENCE",
    secret: false,
    metric: { kind: "counter", key: "RESEARCH_PROJECTS_COMPLETED" },
    tiers: [
      {
        tier: 1,
        threshold: 3,
        titleKey: "researchProjects.t1.title",
        descKey: "researchProjects.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 10,
        titleKey: "researchProjects.t2.title",
        descKey: "researchProjects.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 25,
        titleKey: "researchProjects.t3.title",
        descKey: "researchProjects.t3.desc",
        points: 20,
      },
    ],
  },

  // ============= TRADE (10) =============
  {
    id: "FIRST_TRADE",
    category: "TRADE",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "firstTrade.title",
        descKey: "firstTrade.desc",
        points: 5,
      },
    ],
  },
  {
    id: "TRADES_COMPLETED",
    category: "TRADE",
    secret: false,
    metric: { kind: "counter", key: "TRADES_COMPLETED" },
    tiers: [
      { tier: 1, threshold: 5, titleKey: "trades.t1.title", descKey: "trades.t1.desc", points: 5 },
      {
        tier: 2,
        threshold: 25,
        titleKey: "trades.t2.title",
        descKey: "trades.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 100,
        titleKey: "trades.t3.title",
        descKey: "trades.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "TRADE_PARTNERS",
    category: "TRADE",
    secret: false,
    metric: { kind: "set", key: "TRADE_PARTNERS" }, // socios únicos
    tiers: [
      {
        tier: 1,
        threshold: 3,
        titleKey: "tradePartners.t1.title",
        descKey: "tradePartners.t1.desc",
        points: 5,
      },
    ],
  },
  {
    id: "SHIPS_TRADED",
    category: "TRADE",
    secret: true,
    metric: { kind: "counter", key: "SHIPS_TRADED" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "shipsTraded.t1.title",
        descKey: "shipsTraded.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 10,
        titleKey: "shipsTraded.t2.title",
        descKey: "shipsTraded.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 100,
        titleKey: "shipsTraded.t3.title",
        descKey: "shipsTraded.t3.desc",
        points: 50,
      },
    ],
  },
  {
    id: "NO_FRIENDS",
    category: "TRADE",
    secret: true,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "noFriends.t1.title",
        descKey: "noFriends.t1.desc",
        points: 5,
      },
    ],
  },

  // ============= EXPLORATION (10) =============
  {
    id: "TILES_TERRAFORMED",
    category: "EXPLORATION",
    secret: false,
    metric: { kind: "counter", key: "TILES_TERRAFORMED" },
    tiers: [
      {
        tier: 1,
        threshold: 11,
        titleKey: "tilesTerraformed.t1.title",
        descKey: "tilesTerraformed.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 23,
        titleKey: "tilesTerraformed.t2.title",
        descKey: "tilesTerraformed.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 40,
        titleKey: "tilesTerraformed.t3.title",
        descKey: "tilesTerraformed.t3.desc",
        points: 20,
      },
    ],
  },
  {
    id: "H2O_FOUND",
    category: "EXPLORATION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      { tier: 1, threshold: 1, titleKey: "h2oFound.title", descKey: "h2oFound.desc", points: 10 },
    ],
  },
  {
    id: "ALIEN_TECH_FOUND",
    category: "EXPLORATION",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "alienRuins.title",
        descKey: "alienRuins.desc",
        points: 15,
      },
    ],
  },
  {
    id: "SYSTEMS_EXPLORED",
    category: "EXPLORATION",
    secret: false,
    metric: { kind: "counter", key: "SYSTEMS_EXPLORED" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "systems.t1.title",
        descKey: "systems.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 3,
        titleKey: "systems.t2.title",
        descKey: "systems.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 5,
        titleKey: "systems.t3.title",
        descKey: "systems.t3.desc",
        points: 30,
      },
    ],
  },
  {
    id: "MAX_LEVEL_ANTENNA",
    category: "EXPLORATION",
    secret: true,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "maxLevelAntenna.title",
        descKey: "maxLevelAntenna.desc",
        points: 20,
      },
    ],
  },

  // ============= COMBAT (10) =============
  {
    id: "FIRST_BATTLE_WON",
    category: "COMBAT",
    secret: false,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "firstBattle.title",
        descKey: "firstBattle.desc",
        points: 5,
      },
    ],
  },
  {
    id: "BATTLES_WON",
    category: "COMBAT",
    secret: false,
    metric: { kind: "counter", key: "BATTLES_WON" },
    tiers: [
      {
        tier: 1,
        threshold: 3,
        titleKey: "battles.t1.title",
        descKey: "battles.t1.desc",
        points: 5,
      },
      {
        tier: 2,
        threshold: 15,
        titleKey: "battles.t2.title",
        descKey: "battles.t2.desc",
        points: 10,
      },
      {
        tier: 3,
        threshold: 50,
        titleKey: "battles.t3.title",
        descKey: "battles.t3.desc",
        points: 20,
      },
      {
        tier: 4,
        threshold: 250,
        titleKey: "battles.t4.title",
        descKey: "battles.t4.desc",
        points: 50,
      },
      {
        tier: 5,
        threshold: 1000,
        titleKey: "battles.t5.title",
        descKey: "battles.t5.desc",
        points: 100,
      },
    ],
  },
  {
    id: "NO_LOSSES_BATTLE",
    category: "COMBAT",
    secret: true,
    metric: { kind: "boolean" },
    tiers: [
      { tier: 1, threshold: 1, titleKey: "noLosses.title", descKey: "noLosses.desc", points: 15 },
    ],
  },

  // ============= META (10) =============
  {
    id: "COLLECT_ALL_SHIPS",
    category: "META",
    secret: true,
    metric: { kind: "set", key: "SHIP_BLUEPRINTS_OWNED" },
    tiers: [
      {
        tier: 1,
        threshold: 12,
        titleKey: "collectAllShips.title",
        descKey: "collectAllShips.desc",
        points: 50,
      },
    ],
  },
  {
    id: "ALL_RESEARCH_COMPLETE",
    category: "META",
    secret: true,
    metric: { kind: "boolean" },
    tiers: [
      {
        tier: 1,
        threshold: 1,
        titleKey: "allResearch.title",
        descKey: "allResearch.desc",
        points: 40,
      },
    ],
  },
];

export const defaultProg = {
  progress: 0,
  unlockedTier: 0,
  claimedTier: 0,
  nextThreshold: 0,
  ratio: 0,
};
