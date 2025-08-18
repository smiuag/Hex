export type ResourceType = "METAL" | "STONE" | "ENERGY" | "CRYSTAL";
export type SpecialResourceType = "ILMENITA" | "AETHERIUM" | "THARNIO" | "KAIROX" | "NEBULITA";

export const NORMAL_KEYS = new Set(["STONE", "METAL", "CRYSTAL", "ENERGY"]);

export const SPECIAL_TYPES = [
  "ILMENITA",
  "AETHERIUM",
  "THARNIO",
  "KAIROX",
  "NEBULITA",
  //"ADN",
] as const;
export type Resources = Record<ResourceType, number>;
export type SpecialResources = Record<SpecialResourceType, number>;
export type CombinedResourcesType = ResourceType | SpecialResourceType;
export type CombinedResources = Partial<Record<CombinedResourcesType, number>>;

export type StoredResources = {
  resources: Partial<CombinedResources>;
  lastUpdate: number;
  production: Partial<CombinedResources>;
};

export type ResourceChance = [number, [number, number]]; // [%, [min, max]]
