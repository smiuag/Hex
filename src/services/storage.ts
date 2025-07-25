import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fleet } from "../../src/types/fleetType";
import { Hex } from "../../src/types/hexTypes";
import { PlayerQuest } from "../../src/types/questType";
import { Research } from "../../src/types/researchTypes";
import { StoredResources } from "../../src/types/resourceTypes";
import { getInitialResources } from "../../utils/mapUtils";
import { PlayerConfig } from "../types/configTypes";

const MAP_KEY = "player_map";
const RESOURCES_KEY = "player_resources";
const RESEARCH_KEY = "player_research";
const FLEET_KEY = "player_fleet";
const CONFIG_KEY = "player_config";
const QUESTS_KEY = "player_quests";

//MAP_KEY
export const saveMap = async (hexes: Hex[]) => {
  await AsyncStorage.setItem(MAP_KEY, JSON.stringify(hexes));
};

export const loadMap = async (): Promise<Hex[] | null> => {
  const data = await AsyncStorage.getItem(MAP_KEY);
  return data ? JSON.parse(data) : null;
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
  return data ? JSON.parse(data) : null;
};

export const deleteResearch = async () => {
  await AsyncStorage.removeItem(RESEARCH_KEY);
};

//FLEET_KEY
export const saveFleet = async (researchList: Fleet[]) => {
  await AsyncStorage.setItem(FLEET_KEY, JSON.stringify(researchList));
};

export const loadFleet = async (): Promise<Fleet[] | null> => {
  const data = await AsyncStorage.getItem(FLEET_KEY);
  return data ? JSON.parse(data) : null;
};

export const deleteFleet = async () => {
  await AsyncStorage.removeItem(FLEET_KEY);
};

//QUESTS_KEY
export const saveQuests = async (quests: PlayerQuest[]): Promise<void> => {
  await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
};

export const loadQuests = async (): Promise<PlayerQuest[] | null> => {
  const data = await AsyncStorage.getItem(QUESTS_KEY);
  return data ? JSON.parse(data) : null;
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
  return data ? JSON.parse(data) : null;
};

export const deleteConfig = async (): Promise<void> => {
  await AsyncStorage.removeItem(CONFIG_KEY);
};
