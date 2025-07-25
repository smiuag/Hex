import {} from "../src/constants/general";
import {
  PlayerConfig,
  SCALE,
  ScaleSize,
  ScaleValues,
} from "../src/types/configTypes";

export function getScaleValues(playerConfig: PlayerConfig): ScaleValues {
  const mapSizeEntry = playerConfig.find((entry) => entry.key === "MAP_SIZE");
  const defaultKey: ScaleSize = "SMALL";

  const key = mapSizeEntry?.value as ScaleSize | undefined;

  if (!key || !(key in SCALE)) {
    return SCALE[defaultKey];
  }

  return SCALE[key];
}
