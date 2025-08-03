import {} from "@/src/constants/general";
import {
  defaultPlayerConfig,
  PlayerConfig,
  SCALE,
  ScaleSize,
  ScaleValues,
} from "@/src/types/configTypes";
import { StarSystemMap } from "@/src/types/starSystemTypes";
import { getRandomStartSystem } from "./starSystemUtils";

export function getScaleValues(playerConfig: PlayerConfig): ScaleValues {
  const mapSizeEntry = playerConfig.find((entry) => entry.key === "MAP_SIZE");
  const defaultKey: ScaleSize = "SMALL";

  const key = mapSizeEntry?.value as ScaleSize | undefined;

  if (!key || !(key in SCALE)) {
    return SCALE[defaultKey];
  }

  return SCALE[key];
}

export function gameStarted(playerConfig: PlayerConfig): boolean {
  const started = playerConfig.find((entry) => entry.key === "GAME_STARTED");

  return started?.value === "true";
}

export function gameStartingSystem(playerConfig: PlayerConfig): string {
  const system = playerConfig.find((entry) => entry.key === "STARTING_SYSTEM");

  return system?.value!;
}

export function getStartingConfig(universe: StarSystemMap) {
  const startingSystem = getRandomStartSystem(universe);
  const startingPlayerConfig: PlayerConfig = [
    ...defaultPlayerConfig,
    { key: "STARTING_SYSTEM", value: startingSystem.id },
  ];

  return startingPlayerConfig;
}
