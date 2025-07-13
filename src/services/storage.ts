import AsyncStorage from '@react-native-async-storage/async-storage';
import { TerrainType } from '../../data/tipos';

type Hex = {
  q: number;
  r: number;
  terrain: TerrainType;
};

const MAP_KEY = 'currentMap';

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