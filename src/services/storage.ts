import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest } from "../../src/types/questType";
import { Research } from "../../src/types/researchTypes";
import { StoredResources } from "../../src/types/resourceTypes";
import { Ship } from "../../src/types/shipType";
import { getInitialResources } from "../../utils/hexUtils";
import { PlayerConfig } from "../types/configTypes";
import { FleetData } from "../types/fleetType";
import { StarSystem } from "../types/starSystemTypes";

const MAP_KEY = "player_map";
const RESOURCES_KEY = "player_resources";
const RESEARCH_KEY = "player_research";
const SHIP_KEY = "player_ship";
const CONFIG_KEY = "player_config";
const QUESTS_KEY = "player_quests";
const STAR_SYSTEM_KEY = "player_star_systems";
const FLEET_KEY = "player_fleet";

//MAP_KEY
export const saveMap = async (hexes: Hex[]) => {
  await AsyncStorage.setItem(MAP_KEY, JSON.stringify(hexes));
};

export const loadMap = async (): Promise<Hex[] | null> => {
  const data = await AsyncStorage.getItem(MAP_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteMap = async () => {
  await AsyncStorage.removeItem(MAP_KEY);
};

//RESOURCES_KEY
export async function loadResources(): Promise<StoredResources> {
  const raw = await AsyncStorage.getItem(RESOURCES_KEY);

  if (!raw) return getInitialResources();
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialResources();
  }
}

export async function saveResources(data: StoredResources): Promise<void> {
  await AsyncStorage.setItem(RESOURCES_KEY, JSON.stringify(data));
}

export async function resetResources(): Promise<void> {
  await AsyncStorage.removeItem(RESOURCES_KEY);
}

//RESEARCH_KEY
export const saveResearch = async (researchList: Research[]) => {
  await AsyncStorage.setItem(RESEARCH_KEY, JSON.stringify(researchList));
};

export const loadResearch = async (): Promise<Research[] | null> => {
  const data = await AsyncStorage.getItem(RESEARCH_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteResearch = async () => {
  await AsyncStorage.removeItem(RESEARCH_KEY);
};

//SHIP_KEY
export const saveShip = async (researchList: Ship[]) => {
  await AsyncStorage.setItem(SHIP_KEY, JSON.stringify(researchList));
};

export const loadShip = async (): Promise<Ship[] | null> => {
  const data = await AsyncStorage.getItem(SHIP_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteShip = async () => {
  await AsyncStorage.removeItem(SHIP_KEY);
};

//QUESTS_KEY
export const saveQuests = async (quests: PlayerQuest[]): Promise<void> => {
  await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
};

export const loadQuests = async (): Promise<PlayerQuest[] | null> => {
  const data = await AsyncStorage.getItem(QUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteQuests = async (): Promise<void> => {
  await AsyncStorage.removeItem(QUESTS_KEY);
};

//CONFIG_KEY
export const saveConfig = async (config: PlayerConfig): Promise<void> => {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const loadConfig = async (): Promise<PlayerConfig | null> => {
  const data = await AsyncStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteConfig = async (): Promise<void> => {
  await AsyncStorage.removeItem(CONFIG_KEY);
};

//STAR_SYSTEM_KEY
export const saveStarSystem = async (starSystem: StarSystem[] | null): Promise<void> => {
  await AsyncStorage.setItem(STAR_SYSTEM_KEY, JSON.stringify(starSystem));
};

export const loadStarSystem = async (): Promise<StarSystem[] | null> => {
  const data = await AsyncStorage.getItem(STAR_SYSTEM_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteStarSystem = async (): Promise<void> => {
  await AsyncStorage.removeItem(STAR_SYSTEM_KEY);
};

//FLEET_KEY
export const saveFleet = async (fleet: FleetData[] | null): Promise<void> => {
  await AsyncStorage.setItem(FLEET_KEY, JSON.stringify(fleet));
};

export const loadFleet = async (): Promise<FleetData[] | null> => {
  const data = await AsyncStorage.getItem(FLEET_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteFleet = async (): Promise<void> => {
  await AsyncStorage.removeItem(FLEET_KEY);
};
